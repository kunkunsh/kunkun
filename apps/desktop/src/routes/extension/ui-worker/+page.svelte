<script lang="ts">
	import { appState } from "@/stores/appState.js"
	import { winExtMap } from "@/stores/winExtMap.js"
	import { listenToRefreshDevExt } from "@/utils/tauri-events.js"
	import { isInMainWindow } from "@/utils/window.js"
	import { type Remote } from "@huakunshen/comlink"
	import { db } from "@kksh/api/commands"
	import {
		constructJarvisServerAPIWithPermissions,
		exposeApiToWorker,
		type IApp,
		type IUiWorker
	} from "@kksh/api/ui"
	import {
		// constructJarvisExtDBToServerDbAPI,
		FormNodeNameEnum,
		FormSchema,
		ListSchema,
		Markdown,
		MarkdownSchema,
		NodeNameEnum,
		toast,
		wrap,
		type IComponent,
		type IDb,
		type WorkerExtension
	} from "@kksh/api/ui/worker"
	import { Button } from "@kksh/svelte5"
	import { LoadingBar } from "@kksh/ui"
	import { Templates } from "@kksh/ui/extension"
	import { GlobalCommandPaletteFooter } from "@kksh/ui/main"
	import type { UnlistenFn } from "@tauri-apps/api/event"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { readTextFile } from "@tauri-apps/plugin-fs"
	import { debug } from "@tauri-apps/plugin-log"
	import { goto } from "$app/navigation"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { onDestroy, onMount } from "svelte"
	import * as v from "valibot"

	const { data } = $props()
	let { loadedExt, scriptPath, extInfoInDB } = $derived(data)
	let workerAPI: Remote<WorkerExtension> | undefined = undefined
	let unlistenRefreshWorkerExt: UnlistenFn | undefined
	let worker: Worker | undefined
	let listViewContent = $state<ListSchema.List>()
	let formViewContent = $state<FormSchema.Form>()
	let markdownViewContent = $state<MarkdownSchema>()
	let extensionLoadingBar = $state(false) // whether extension called showLoadingBar
	let pbar = $state<number | null>(null)
	let loading = $state(false)
	let searchTerm = $state("")
	let searchBarPlaceholder = $state("")
	const appWin = getCurrentWebviewWindow()
	const loadingBar = $derived($appState.loadingBar || extensionLoadingBar)
	let loaded = $state(false)

	async function goBack() {
		if (isInMainWindow()) {
			// if in main window, then winExtMap store must contain this
			winExtMap.unregisterExtensionFromWindow(appWin.label)
			goto("/")
		} else {
			appWin.close()
		}
	}

	function clearViewContent(keep?: "list" | "form" | "markdown") {
		if (keep !== "list") {
			listViewContent = undefined
		}
		if (keep !== "form") {
			formViewContent = undefined
		}
		if (keep !== "markdown") {
			markdownViewContent = undefined
		}
	}

	const extUiAPI: IUiWorker = {
		async render(view: IComponent<ListSchema.List | FormSchema.Form | Markdown>) {
			if (view.nodeName === NodeNameEnum.List) {
				clearViewContent("list")
				const parsedListView = v.parse(ListSchema.List, view)
				const updateFields = {
					sections: true,
					items: true,
					detail: true,
					filter: true,
					actions: true,
					defaultAction: true
				}
				if (listViewContent) {
					if (parsedListView.inherits && parsedListView.inherits.length > 0) {
						if (parsedListView.inherits.includes("items")) {
							updateFields.items = false
						}
						if (parsedListView.inherits.includes("sections")) {
							updateFields.sections = false
						}
						if (parsedListView.inherits.includes("detail")) {
							updateFields.detail = false
						}
						if (parsedListView.inherits.includes("filter")) {
							updateFields.filter = false
						}
						if (parsedListView.inherits.includes("actions")) {
							updateFields.actions = false
						}
						if (parsedListView.inherits.includes("defaultAction")) {
							updateFields.defaultAction = false
						}
						if (updateFields.items) {
							listViewContent.items = parsedListView.items
						}
						if (updateFields.sections) {
							listViewContent.sections = parsedListView.sections
						}
						if (updateFields.detail) {
							listViewContent.detail = parsedListView.detail
						}
						if (updateFields.filter) {
							listViewContent.filter = parsedListView.filter
						}
						if (updateFields.actions) {
							listViewContent.actions = parsedListView.actions
						}
						if (updateFields.defaultAction) {
							listViewContent.defaultAction = parsedListView.defaultAction
						}
						listViewContent.inherits = parsedListView.inherits
					} else {
						listViewContent = parsedListView
					}
				} else {
					listViewContent = parsedListView
				}

				// if (parsedListView.updateDetailOnly) {
				// 	if (listViewContent) {
				// 		listViewContent.detail = parsedListView.detail
				// 	} else {
				// 		listViewContent = parsedListView
				// 	}
				// } else {
				// 	listViewContent = parsedListView
				// }
			} else if (view.nodeName === FormNodeNameEnum.Form) {
				listViewContent = undefined
				console.log("render form", view)
				clearViewContent("form")
				const parsedForm = v.parse(FormSchema.Form, view)
				console.log("parsedForm", parsedForm)
				formViewContent = parsedForm
				// TODO: convert form to zod schema
				// const zodSchema = convertFormToZod(parsedForm)
				// formViewZodSchema = zodSchema
				// formFieldConfig = buildFieldConfig(parsedForm)
			} else if (view.nodeName === NodeNameEnum.Markdown) {
				clearViewContent("markdown")
				markdownViewContent = v.parse(MarkdownSchema, view)
			} else {
				toast.error(`Unsupported view type: ${view.nodeName}`)
			}
		},
		async showLoadingBar(loading: boolean) {
			// appState.setLoadingBar(loading)
			extensionLoadingBar = loading
		},
		async setProgressBar(progress: number | null) {
			pbar = progress
		},
		async setScrollLoading(_loading: boolean) {
			loading = _loading
		},
		async setSearchTerm(term: string) {
			searchTerm = term
		},
		async setSearchBarPlaceholder(placeholder: string) {
			console.log("setSearchBarPlaceholder", placeholder)
			searchBarPlaceholder = placeholder
		},
		async goBack() {
			goBack()
		}
	}

	async function launchWorkerExt() {
		if (worker) {
			worker.terminate()
			worker = undefined
		}
		const workerScript = await readTextFile(scriptPath)
		const blob = new Blob([workerScript], { type: "application/javascript" })
		const blobURL = URL.createObjectURL(blob)
		const serverAPI: Record<string, any> = constructJarvisServerAPIWithPermissions(
			loadedExt.kunkun.permissions,
			loadedExt.extPath
		)
		serverAPI.iframeUi = undefined
		serverAPI.workerUi = extUiAPI
		serverAPI.db = new db.JarvisExtDB(extInfoInDB.extId)
		serverAPI.app = {
			language: () => Promise.resolve("en")
		} satisfies IApp
		worker = new Worker(blobURL)
		exposeApiToWorker(worker, serverAPI)
		workerAPI = wrap<WorkerExtension>(worker)
		await workerAPI.load()
	}

	$effect(() => {
		launchWorkerExt()

		onDestroy(() => {
			worker?.terminate()
		})
	})
	onMount(async () => {
		setTimeout(() => {
			appState.setLoadingBar(true)
			appWin.show()
		}, 100)
		unlistenRefreshWorkerExt = await listenToRefreshDevExt(() => {
			debug("Refreshing Worker Extension")
			launchWorkerExt()
		})
		setTimeout(() => {
			appState.setLoadingBar(false)
			loaded = true
		}, 500)
	})

	onDestroy(() => {
		unlistenRefreshWorkerExt?.()
		extensionLoadingBar = false
	})
</script>

{#if loadingBar}
	<LoadingBar color="white" />
{/if}
{#if loaded && listViewContent !== undefined}
	<Templates.ListView
		bind:searchTerm
		bind:searchBarPlaceholder
		{pbar}
		{listViewContent}
		{loading}
		onGoBack={goBack}
		onListScrolledToBottom={() => {
			workerAPI?.onListScrolledToBottom()
		}}
		onEnterKeyPressed={() => {
			workerAPI?.onEnterPressedOnSearchBar()
		}}
		onListItemSelected={(value: string) => {
			workerAPI?.onListItemSelected(value)
		}}
		onSearchTermChange={(searchTerm) => {
			workerAPI?.onSearchTermChange(searchTerm)
		}}
		onHighlightedItemChanged={(value) => {
			workerAPI?.onHighlightedListItemChanged(value)
		}}
	>
		{#snippet footer()}
			<GlobalCommandPaletteFooter />
		{/snippet}
	</Templates.ListView>
{:else if loaded && formViewContent !== undefined}
	<Templates.FormView {formViewContent} onGoBack={goBack} />
{/if}
