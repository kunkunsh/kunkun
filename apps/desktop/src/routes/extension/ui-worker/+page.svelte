<script lang="ts">
	import { winExtMap } from "@/stores/winExtMap.js"
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
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { readTextFile } from "@tauri-apps/plugin-fs"
	import { goto } from "$app/navigation"
	import { onDestroy, onMount } from "svelte"
	import * as v from "valibot"

	const { data } = $props()
	let { loadedExt, scriptPath, extInfoInDB } = $derived(data)
	let workerAPI: Remote<WorkerExtension> | undefined = undefined
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
			console.log(view)

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
				clearViewContent("form")
				const parsedForm = v.parse(FormSchema.Form, view)
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
		workerAPI = wrap<WorkerExtension>(worker)
		await workerAPI.load()
	}

	$effect(() => {
		launchWorkerExt()

		onDestroy(() => {
			worker?.terminate()
		})
	})
	onMount(async () => {})

	onDestroy(() => {})
</script>

<!-- <div class="h-10 bg-red-500" data-tauri-drag-region></div> -->
<pre>listViewContent: {JSON.stringify(listViewContent, null, 2)}</pre>
