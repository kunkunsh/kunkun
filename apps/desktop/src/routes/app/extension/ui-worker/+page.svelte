<script lang="ts">
	import { i18n } from "@/i18n.js"
	import { appState } from "@/stores/appState.js"
	import { keys } from "@/stores/keys"
	import { winExtMap } from "@/stores/winExtMap.js"
	import { helperAPI } from "@/utils/helper.js"
	import { paste } from "@/utils/hotkey"
	import { decideKkrpcSerialization } from "@/utils/kkrpc.js"
	import {
		emitReloadOneExtension,
		listenToFileDrop,
		listenToRefreshDevExt
	} from "@/utils/tauri-events.js"
	import { sleep } from "@/utils/time.js"
	import { isInMainWindow } from "@/utils/window.js"
	import { db } from "@kksh/api/commands"
	import {
		constructJarvisServerAPIWithPermissions,
		type IApp,
		type IUiTemplate
	} from "@kksh/api/ui"
	import {
		FormNodeNameEnum,
		FormSchema,
		ListSchema,
		MarkdownSchema,
		NodeNameEnum,
		toast,
		type IComponent,
		type TemplateUiCommand
	} from "@kksh/api/ui/template"
	import { Button, Form } from "@kksh/svelte5"
	import { LoadingBar } from "@kksh/ui"
	import { Templates } from "@kksh/ui/extension"
	import { GlobalCommandPaletteFooter } from "@kksh/ui/main"
	import type { IKunkunFullServerAPI } from "@kunkunapi/src/api/server"
	import {
		RECORD_EXTENSION_PROCESS_EVENT,
		type IRecordExtensionProcessEvent
	} from "@kunkunapi/src/events.js"
	import { Channel, invoke } from "@tauri-apps/api/core"
	import { emitTo, type UnlistenFn } from "@tauri-apps/api/event"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { getCurrentWindow } from "@tauri-apps/api/window"
	import * as fs from "@tauri-apps/plugin-fs"
	import { readTextFile } from "@tauri-apps/plugin-fs"
	import { debug, info } from "@tauri-apps/plugin-log"
	import { platform } from "@tauri-apps/plugin-os"
	import { goto } from "$app/navigation"
	import { RPCChannel, WorkerParentIO } from "kkrpc/browser"
	import { onDestroy, onMount, tick } from "svelte"
	import Inspect from "svelte-inspect-value"
	import { type CommandEvent } from "tauri-plugin-shellx-api"
	import * as v from "valibot"

	const { data } = $props()
	let listviewInputRef = $state<HTMLInputElement | null>(null)
	let { loadedExt, scriptPath, extInfoInDB } = $derived(data)
	let actionPanelOpen = $state(false)
	let workerAPI: TemplateUiCommand | undefined = undefined
	let unlistenRefreshWorkerExt: UnlistenFn | undefined
	let unlistenFileDrop: UnlistenFn | undefined
	let worker: Worker | undefined
	let listViewContent = $state<ListSchema.List | null>(null)
	let formViewContent = $state<FormSchema.Form | null>(null)
	let markdownViewContent = $state<MarkdownSchema | null>(null)
	let extensionLoadingBar = $state(false) // whether extension called showLoadingBar
	let pbar = $state<number | null>(null)
	let loading = $state(false)
	let searchTerm = $state("")
	let searchBarPlaceholder = $state("")
	let extSpawnedProcesses = $state<number[]>([])
	const appWin = getCurrentWebviewWindow()
	const loadingBar = $derived($appState.loadingBar || extensionLoadingBar)
	let loaded = $state(false)
	let listview: Templates.ListView | undefined = $state(undefined)
	const _platform = platform()
	let unlistenPkgJsonWatch: UnlistenFn | undefined
	let curViewNodeName = $state<NodeNameEnum | FormNodeNameEnum | null>(null)
	async function goBack() {
		if (isInMainWindow()) {
			goto(i18n.resolveRoute("/app/"))
		} else {
			appWin.close()
		}
	}

	async function clearViewContent(keep?: "list" | "form" | "markdown") {
		if (keep !== "list") {
			listViewContent = null
		}
		if (keep !== "form") {
			formViewContent = null
		}
		if (keep !== "markdown") {
			markdownViewContent = null
		}
		await tick()
		// await sleep(3000)
	}

	const extUiAPI: IUiTemplate = {
		async render(_view: IComponent<ListSchema.List | FormSchema.Form | MarkdownSchema>) {
			// console.log("render nodeName", _view.nodeName)
			// console.log("render", _view)
			curViewNodeName = _view.nodeName
			if (_view.nodeName === NodeNameEnum.List) {
				await clearViewContent("list")
				const parsedListViewRes = v.safeParse(ListSchema.List, _view)
				if (!parsedListViewRes.success) {
					toast.error("Invalid List View", {
						description: "See console for details"
					})
					console.error("Fail to parse List View", v.flatten(parsedListViewRes.issues))
					return
				}
				const parsedListView = parsedListViewRes.output
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

				// on each render, also update the default action and action panel
				if (listViewContent?.defaultAction) {
					appState.setDefaultAction(listViewContent.defaultAction)
				}
				if (listViewContent?.actions) {
					appState.setActionPanel(listViewContent.actions)
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
			} else if (_view.nodeName === FormNodeNameEnum.Form) {
				listViewContent = null
				// await clearViewContent("form")
				// await tick()
				const parsedForm = v.parse(FormSchema.Form, _view)
				formViewContent = parsedForm
				// TODO: convert form to zod schema
				// const zodSchema = convertFormToZod(parsedForm)
				// formViewZodSchema = zodSchema
				// formFieldConfig = buildFieldConfig(parsedForm)
			} else if (_view.nodeName === NodeNameEnum.Markdown) {
				await clearViewContent("markdown")
				await tick()
				markdownViewContent = v.parse(MarkdownSchema, _view)
			} else {
				toast.error(`Unsupported view type: ${_view.nodeName}`)
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
			console.log("goBack in ui-worker")
			goBack()
		}
	}

	async function launchWorkerExt() {
		if (worker) {
			worker.terminate()
			worker = undefined
		}
		appState.setDefaultAction(null)
		appState.setActionPanel(undefined)
		const workerScript = await readTextFile(scriptPath)
		const blob = new Blob([workerScript], { type: "application/javascript" })
		const blobURL = URL.createObjectURL(blob)
		worker = new Worker(blobURL)
		const serverAPI: IKunkunFullServerAPI = constructJarvisServerAPIWithPermissions(
			loadedExt.kunkun.permissions,
			loadedExt.extPath,
			{
				recordSpawnedProcess: async (pid: number) => {
					extSpawnedProcesses = [...extSpawnedProcesses, pid]
					// winExtMap.registerProcess(appWin.label, pid)
					const curWin = await getCurrentWindow()
					await emitTo("main", RECORD_EXTENSION_PROCESS_EVENT, {
						windowLabel: curWin.label,
						pid
					} satisfies IRecordExtensionProcessEvent)
					// TODO: record process in a store
				},
				getSpawnedProcesses: () => Promise.resolve(extSpawnedProcesses),
				paste: async () => {
					await appWin.hide()
					await sleep(200)
					return paste()
				}
			}
		)
		const serverAPI2 = {
			...serverAPI,
			iframeUi: undefined,
			workerUi: extUiAPI,
			helper: helperAPI,
			db: new db.JarvisExtDB(extInfoInDB.extId),
			kv: new db.KV(extInfoInDB.extId),
			app: {
				language: () => Promise.resolve("en")
			} satisfies IApp
		}
		const io = new WorkerParentIO(worker)
		const kkrpcSerialization = decideKkrpcSerialization(loadedExt)
		info(
			`Establishing kkrpc connection for ${loadedExt.kunkun.identifier} with serialization: ${kkrpcSerialization}`
		)
		const rpc = new RPCChannel<typeof serverAPI2, TemplateUiCommand>(io, {
			expose: serverAPI2,
			serialization: {
				version: kkrpcSerialization
			}
		})
		workerAPI = rpc.getAPI()
		await workerAPI.load()
	}

	$effect(() => {
		launchWorkerExt()
		return () => {
			worker?.terminate()
		}
	})

	// function onPkgJsonChange(evt: fs.WatchEvent) {
	// 	const parsed = v.safeParse(WatchEvent, evt)
	// 	if (parsed.success) {
	// 		if (
	// 			parsed.output.type.modify.kind === "data" &&
	// 			parsed.output.type.modify.mode === "content" &&
	// 			parsed.output.paths.includes(data.pkgJsonPath)
	// 		) {
	// 			console.log("pkgJson changed", parsed.output.paths)
	// 			// emit event to reload extension commands
	// 			emitReloadOneExtension(loadedExt.extPath)
	// 		}
	// 	}
	// }

	onMount(async () => {
		setTimeout(() => {
			appState.setLoadingBar(true)
			appWin.show()
		}, 100)
		unlistenRefreshWorkerExt = await listenToRefreshDevExt(() => {
			debug("Refreshing Worker Extension")
			winExtMap.cleanupProcessesFromWindow(appWin.label)
			launchWorkerExt()
		})
		unlistenFileDrop = await listenToFileDrop((evt) => {
			workerAPI?.onFilesDropped(evt.payload.paths)
			appWin.setFocus()
			listview?.inputFocus()
		})
		setTimeout(() => {
			appState.setLoadingBar(false)
			loaded = true
		}, 500)
		// fs.watch(data.pkgJsonPath, onPkgJsonChange).then((unlisten) => {
		// 	unlistenPkgJsonWatch = unlisten
		// })
	})

	onDestroy(() => {
		unlistenRefreshWorkerExt?.()
		unlistenFileDrop?.()
		unlistenPkgJsonWatch?.()
		winExtMap.unregisterExtensionFromWindow(appWin.label)
		extensionLoadingBar = false
		appState.setActionPanel(undefined)
		appState.setDefaultAction(null)
		appState.setActionPanel(undefined)
	})

	$effect(() => {
		void $keys
		const keySet = keys.getSet()
		if (
			keySet.size === 2 &&
			keySet.has(_platform === "macos" ? "Meta" : "Control") &&
			keySet.has("k")
		) {
			// actionPanelOpen = true
			setTimeout(() => {
				actionPanelOpen = !actionPanelOpen
				if (!actionPanelOpen) {
					onActionPanelBlur()
				}
			}, 100)
		}
	})

	function onActionPanelBlur() {
		setTimeout(() => {
			listviewInputRef?.focus()
		}, 300)
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			if (document.activeElement?.nodeName === "INPUT") {
				console.log("input")
			}
		}
	}
</script>

<svelte:window on:keydown={onkeydown} />
{#if loadingBar}
	<LoadingBar class="fixed left-0 top-0 w-full" color="white" />
{/if}

{#if curViewNodeName === NodeNameEnum.List && listViewContent}
	<Templates.ListView
		bind:inputRef={listviewInputRef}
		bind:searchTerm
		bind:searchBarPlaceholder
		bind:this={listview}
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
		onSearchTermChange={(searchTerm: string) => {
			workerAPI?.onSearchTermChange(searchTerm)
		}}
		onHighlightedItemChanged={(item: ListSchema.Item) => {
			if (item.defaultAction) {
				appState.setDefaultAction(item.defaultAction)
			} else if (listViewContent?.defaultAction) {
				appState.setDefaultAction(listViewContent.defaultAction)
			}
			if (item.actions) {
				appState.setActionPanel(item.actions)
			} else if (listViewContent?.actions) {
				appState.setActionPanel(listViewContent.actions)
			}
			workerAPI?.onHighlightedListItemChanged(item.value)
		}}
	>
		{#snippet footer()}
			<GlobalCommandPaletteFooter
				bind:actionPanelOpen
				actionPanel={$appState.actionPanel}
				defaultAction={$appState.defaultAction ?? undefined}
				{onActionPanelBlur}
				onDefaultActionSelected={() => {
					workerAPI?.onEnterPressedOnSearchBar()
				}}
				onActionSelected={(value: string) => {
					workerAPI?.onActionSelected(value)
				}}
			/>
		{/snippet}
	</Templates.ListView>
{/if}
{#if curViewNodeName === FormNodeNameEnum.Form && formViewContent}
	<Templates.FormView
		{formViewContent}
		{pbar}
		onGoBack={goBack}
		onSubmit={(formData: Record<string, string | number | boolean>) => {
			console.log("Submit formData", formData)
			workerAPI?.onFormSubmit(formData)
		}}
	/>
{/if}
{#if curViewNodeName === NodeNameEnum.Markdown && markdownViewContent}
	<Templates.MarkdownView {markdownViewContent} onGoBack={goBack} />
{/if}
