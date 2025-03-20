<script lang="ts">
	import DanceTransition from "@/components/dance/dance-transition.svelte"
	import { i18n } from "@/i18n"
	import { appConfig, winExtMap } from "@/stores"
	import { helperAPI } from "@/utils/helper"
	import { paste } from "@/utils/hotkey"
	import { goBackOnEscape } from "@/utils/key"
	import { goHome } from "@/utils/route"
	import { positionToCssStyleString, positionToTailwindClasses } from "@/utils/style"
	import { sleep } from "@/utils/time"
	import { isInMainWindow } from "@/utils/window"
	import { ThemeColor, type Position } from "@kksh/api/models"
	import {
		constructJarvisServerAPIWithPermissions,
		// exposeApiToWindow,
		type IApp
	} from "@kksh/api/ui"
	import { toast, type IUiCustomServer1, type IUiCustomServer2 } from "@kksh/api/ui/custom"
	import { db } from "@kksh/drizzle"
	import raycastScript from "@kksh/raycast/host?raw"
	import { Button } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import type { IKunkunFullServerAPI } from "@kunkunapi/src/api/server"
	import {
		RECORD_EXTENSION_PROCESS_EVENT,
		type IRecordExtensionProcessEvent
	} from "@kunkunapi/src/events"
	import { emitTo } from "@tauri-apps/api/event"
	import { appCacheDir, BaseDirectory, join } from "@tauri-apps/api/path"
	import { getCurrentWindow } from "@tauri-apps/api/window"
	import { mkdir, writeTextFile } from "@tauri-apps/plugin-fs"
	import WebSocket from "@tauri-apps/plugin-websocket"
	import { goto } from "$app/navigation"
	import { WebSocketClientIO } from "kkrpc"
	import { IframeParentIO, RPCChannel, type IoInterface } from "kkrpc/browser"
	import { ArrowLeftIcon, MoveIcon, RefreshCcwIcon, XIcon } from "lucide-svelte"
	import { onDestroy, onMount } from "svelte"
	import { Command } from "tauri-plugin-shellx-api"
	import type { PageData } from "./$types"

	let { data }: { data: PageData } = $props()
	const { loadedExt, extPath, extInfoInDB } = data

	let root

	let extSpawnedProcesses = $state<number[]>([])
	const appWin = getCurrentWindow()
	let iframeRef: HTMLIFrameElement
	let uiControl = $state<{
		iframeLoaded: boolean
		showBackBtn: boolean
		showMoveBtn: boolean
		showRefreshBtn: boolean
		backBtnPosition: Position
		moveBtnPosition: Position
		refreshBtnPosition: Position
		transparentBg: boolean
	}>({
		iframeLoaded: true,
		showBackBtn: true, // if open in new window, hide back button
		showMoveBtn: false,
		showRefreshBtn: false,
		backBtnPosition: "top-left",
		moveBtnPosition: "bottom-left",
		refreshBtnPosition: "top-right",
		transparentBg: false
	})

	const iframeUiAPI: IUiCustomServer2 = {
		goBack: async () => {
			if (isInMainWindow()) {
				goto(i18n.resolveRoute("/app/"))
			} else {
				appWin.close()
			}
		},
		hideBackButton: async () => {
			uiControl.showBackBtn = false
		},
		hideMoveButton: async () => {
			uiControl.showMoveBtn = false
		},
		hideRefreshButton: async () => {
			console.log("hideRefreshButton")
			uiControl.showRefreshBtn = false
		},
		showBackButton: async (position?: Position) => {
			console.log("showBackBtn", position)

			uiControl.showBackBtn = true
			uiControl.backBtnPosition = position ?? "top-left"
		},
		showMoveButton: async (position?: Position) => {
			uiControl.showMoveBtn = true
			uiControl.moveBtnPosition = position ?? "bottom-left"
		},
		showRefreshButton: async (position?: Position) => {
			uiControl.showRefreshBtn = true
			uiControl.refreshBtnPosition = position ?? "top-right"
		},
		getTheme: () => {
			const theme = $appConfig.theme
			return Promise.resolve({
				theme: theme.theme as ThemeColor,
				radius: theme.radius,
				lightMode: theme.lightMode
			})
		},
		async reloadPage() {
			location.reload()
		},
		async setTransparentWindowBackground(transparent: boolean) {
			if (isInMainWindow()) {
				throw new Error("Cannot set background in main window")
			}
			if (transparent) {
				document.body.style.backgroundColor = "transparent"
			} else {
				document.body.style.backgroundColor = ""
			}
		}
	}

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
		iframeUi: {
			...serverAPI.iframeUi,
			...iframeUiAPI
		} satisfies IUiCustomServer1 & IUiCustomServer2,
		helper: helperAPI,
		db: new db.JarvisExtDB(extInfoInDB.extId),
		kv: new db.KV(extInfoInDB.extId),
		app: {
			language: () => Promise.resolve("en") // TODO: get locale
		} satisfies IApp
	}

	const elements = new Map()
	const waiting = new Map()

	function getElement(id: number): Promise<HTMLElement> {
		return new Promise((resolve) => {
			if (elements.has(id)) return resolve(elements.get(id))
			if (!waiting.has(id)) waiting.set(id, [])
			waiting.get(id).push(resolve)
		})
	}

	function getElements(...ids: number[]) {
		return Promise.all(ids.map(getElement))
	}

	let eventId = 0
	const events = new Map()

	;(async () => {
		await mkdir("", { baseDir: BaseDirectory.AppCache, recursive: true })
		await writeTextFile("raycast.js", raycastScript, {
			baseDir: BaseDirectory.AppCache
		})
		const path = await join(await appCacheDir(), "raycast.js")

		const node = Command.create("node", [path], {
			cwd: extPath
		})
		const nodeProcess = await node.spawn()
		const { pid } = nodeProcess
		extSpawnedProcesses = [...extSpawnedProcesses, pid]
		const curWin = await getCurrentWindow()
		await emitTo("main", RECORD_EXTENSION_PROCESS_EVENT, {
			windowLabel: curWin.label,
			pid
		} satisfies IRecordExtensionProcessEvent)
		node.on("error", console.error)
		node.stderr.on("data", console.error)

		await new Promise((resolve) => {
			node.stdout.on("data", (data) => {
				resolve(data)
			})
		})

		const { readable, writable } = new TransformStream()
		const reader = readable.getReader()
		const writer = writable.getWriter()
		node.stdout.on("data", (data) => writer.write(data))

		const RPC_METHOD: string = "stdio"
		let stdio: IoInterface
		if (RPC_METHOD === "websocket") {
			const ws = await WebSocket.connect("ws://127.0.0.1:5000")
			ws.addListener((message) => {
				writer.write(message.data)
			})
			stdio = {
				name: "websocket",
				async read() {
					const { value } = await reader.read()
					return value
				},
				write: (data) => ws.send(data)
			}
		} else {
			stdio = {
				name: "stdio",
				async read(): Promise<string | Uint8Array | null> {
					const { value } = await reader.read()
					return value
				},
				async write(data: string): Promise<void> {
					return nodeProcess.write(data + "\n")
				}
			}
		}

		new RPCChannel<{}, {}>(stdio, {
			expose: {
				createInstance(id, type) {
					// console.log("set element", id)
					let element
					if (["svg", "path"].includes(type))
						element = document.createElementNS("http://www.w3.org/2000/svg", type)
					else element = document.createElement(type)
					element._id = id

					elements.set(id, element)

					for (const resolve of waiting.get(id) ?? []) {
						resolve(element)
					}
					waiting.delete(id)
				},
				createTextInstance(id, text) {
					const element = document.createTextNode(text)
					elements.set(id, element)
					element._id = id

					for (const resolve of waiting.get(id) ?? []) {
						resolve(element)
					}
					waiting.delete(id)
				},
				async appendChild(parentId, childId) {
					const [parent, child] = await getElements(parentId, childId)
					parent.appendChild(child)
				},
				async removeChild(parentId, childId) {
					const [parent, child] = await getElements(parentId, childId)
					parent.removeChild(child)

					function removeRecursive(elementId, element) {
						for (const child of element.children) {
							removeRecursive(child._id, child)
						}

						elements.delete(elementId)
						if (waiting.has(elementId)) waiting.delete(elementId)
					}

					removeRecursive(childId, child)
				},
				async insertBefore(parentId, childId, beforeChildId) {
					const [parent, child, beforeChild] = await getElements(parentId, childId, beforeChildId)
					parent.insertBefore(child, beforeChild)
				},
				async setText(elementId, text) {
					const element = await getElement(elementId)
					element.textContent = text
				},
				async applyProps(elementId, props) {
					const element = await getElement(elementId)
					for (let [propName, propValue] of Object.entries(props)) {
						if (propName === "className") propName = "class"

						if (propName === "children") {
							if (typeof propValue === "string" || typeof propValue === "number") {
								element.textContent = propValue.toString()
							}
						} else if (propName.startsWith("on")) {
							element.addEventListener(propName.slice(2).toLowerCase(), async (event) => {
								const id = eventId++
								const serialized = {
									target: {
										value: event.target.value
									},
									key: event.key,
									ctrlKey: event.ctrlKey,
									keyCode: event.keyCode,
									id
								}

								events.set(id, event)

								await new Promise((resolve) => {
									event.__resolve = resolve
									propValue(serialized)
								})

								event.__resolve()
								events.delete(id)
							})
						} else if (propName === "style") {
							for (const [rule, value] of Object.entries(propValue)) {
								element.style[rule] = value
							}
						} else if (propValue === undefined) element.removeAttribute(propName)
						else element.setAttribute(propName, propValue)
					}
				},
				async addEventListener(elementId, type, listener) {
					const element = await getElement(elementId)

					// Since React only allows one event listener per type, we can take advantage of that
					// by storing the listener in the element itself
					if (element._listeners == null) element._listeners = {}
					const existing = element._listeners[type]
					if (existing) element.removeEventListener(type, existing)

					const realListener = async (event) => {
						const id = eventId++
						const serialized = {
							target: {
								value: event.target.value
							},
							key: event.key,
							ctrlKey: event.ctrlKey,
							keyCode: event.keyCode,
							id
						}

						events.set(id, event)

						await new Promise((resolve) => {
							event.__resolve = resolve
							listener(serialized)
						})
					}
					element.addEventListener(type, realListener)
					element._listeners[type] = realListener
				},
				async preventDefault(id) {
					const event = events.get(id)
					if (event) {
						event.preventDefault()
					}
				},
				async clearEvent(id) {
					const event = events.get(id)
					if (event) {
						event.__resolve()
						events.delete(id)
					}
				}
			}
		})
	})()

	function onBackBtnClicked() {
		if (isInMainWindow()) {
			goHome()
		} else {
			appWin.close()
		}
	}

	function onIframeLoaded() {
		setTimeout(() => {
			iframeRef.focus()
			uiControl.iframeLoaded = true
		}, 300)
	}

	onMount(() => {
		elements.set(-1, root)
		setTimeout(() => {
			appWin.show()
		}, 200)
		if (iframeRef?.contentWindow) {
			const io = new IframeParentIO(iframeRef.contentWindow)
			const rpc = new RPCChannel(io, { expose: serverAPI2 })
		} else {
			toast.warning("iframeRef.contentWindow not available")
		}

		setTimeout(() => {
			if (!uiControl.iframeLoaded) {
				toast.error("Extension failed to load")
			}
		}, 3_000)
	})

	onDestroy(() => {
		winExtMap.unregisterExtensionFromWindow(appWin.label)
	})
</script>

<svelte:window on:keydown={goBackOnEscape} />
{#if uiControl.backBtnPosition && uiControl.showBackBtn}
	<Button
		class={cn("absolute", positionToTailwindClasses(uiControl.backBtnPosition))}
		size="icon"
		variant="outline"
		onclick={onBackBtnClicked}
		style={`${positionToCssStyleString(uiControl.backBtnPosition)}`}
	>
		{#if appWin.label === "main"}
			<ArrowLeftIcon class="w-4" />
		{:else}
			<XIcon class="w-4" />
		{/if}
	</Button>
{/if}
{#if uiControl.moveBtnPosition && uiControl.showMoveBtn}
	<Button
		class={cn("absolute", positionToTailwindClasses(uiControl.moveBtnPosition))}
		style={`${positionToCssStyleString(uiControl.moveBtnPosition)}`}
		size="icon"
		variant="outline"
		data-tauri-drag-region
	>
		<MoveIcon data-tauri-drag-region class="w-4" />
	</Button>
{/if}
{#if uiControl.refreshBtnPosition && uiControl.showRefreshBtn}
	<Button
		class={cn("absolute", positionToTailwindClasses(uiControl.refreshBtnPosition))}
		style={`${positionToCssStyleString(uiControl.refreshBtnPosition)}`}
		size="icon"
		variant="outline"
		onclick={iframeUiAPI.reloadPage}
	>
		<RefreshCcwIcon class="w-4" />
	</Button>
{/if}

<main class="h-screen">
	<DanceTransition delay={300} autoHide={false} show={!uiControl.iframeLoaded} />
	<div bind:this={root}></div>
	<!-- <iframe
		bind:this={iframeRef}
		class={cn("h-full", {
			hidden: !uiControl.iframeLoaded
		})}
		onload={onIframeLoaded}
		width="100%"
		height="100%"
		frameborder="0"
		src={data.url}
		title={data.extPath}
	></iframe> -->
</main>
