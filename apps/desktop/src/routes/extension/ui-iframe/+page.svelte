<script lang="ts">
	import DanceTransition from "@/components/dance/dance-transition.svelte"
	import { appConfig, winExtMap } from "@/stores"
	import { goBackOnEscape } from "@/utils/key"
	import { goHome } from "@/utils/route"
	import { positionToCssStyleString, positionToTailwindClasses } from "@/utils/style"
	import { isInMainWindow } from "@/utils/window"
	import { db } from "@kksh/api/commands"
	import { CustomPosition, ThemeColor, type Position } from "@kksh/api/models"
	import {
		constructJarvisServerAPIWithPermissions,
		// exposeApiToWindow,
		type IApp,
		type IUiIframe
	} from "@kksh/api/ui"
	import { toast, type IUiIframeServer2 } from "@kksh/api/ui/iframe"
	import { Button } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import { getCurrentWindow } from "@tauri-apps/api/window"
	import { goto } from "$app/navigation"
	import { IframeParentIO, RPCChannel } from "kkrpc/browser"
	import { ArrowLeftIcon, MoveIcon, RefreshCcwIcon, XIcon } from "lucide-svelte"
	import { onDestroy, onMount } from "svelte"
	import * as v from "valibot"
	import type { PageData } from "./$types"

	let { data }: { data: PageData } = $props()
	const { loadedExt, url, extPath, extInfoInDB } = data
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
		iframeLoaded: false,
		showBackBtn: true, // if open in new window, hide back button
		showMoveBtn: true,
		showRefreshBtn: true,
		backBtnPosition: "top-left",
		moveBtnPosition: "bottom-left",
		refreshBtnPosition: "top-right",
		transparentBg: false
	})

	const iframeUiAPI: IUiIframeServer2 = {
		goBack: async () => {
			if (isInMainWindow()) {
				goto("/app")
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

	const serverAPI: Record<string, any> = constructJarvisServerAPIWithPermissions(
		loadedExt.kunkun.permissions,
		loadedExt.extPath
	)
	serverAPI.iframeUi = {
		...serverAPI.iframeUi,
		...iframeUiAPI
	} satisfies IUiIframe
	serverAPI.db = new db.JarvisExtDB(extInfoInDB.extId)
	serverAPI.app = {
		language: () => Promise.resolve("en") // TODO: get locale
	} satisfies IApp

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
		appWin.show()
		if (iframeRef?.contentWindow) {
			const io = new IframeParentIO(iframeRef.contentWindow)
			const rpc = new RPCChannel(io, { expose: serverAPI })
			// exposeApiToWindow(iframeRef.contentWindow, serverAPI)
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
	<iframe
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
	></iframe>
</main>
