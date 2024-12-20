<script lang="ts">
	import AppContext from "@/components/context/AppContext.svelte"
	import { appConfig, appState, extensions, quickLinks, winExtMap } from "@/stores"
	import { initDeeplink } from "@/utils/deeplink"
	import { updateAppHotkey } from "@/utils/hotkey"
	import { globalKeyDownHandler, goBackOrCloseOnEscape } from "@/utils/key"
	import { listenToWindowBlur } from "@/utils/tauri-events"
	import { isInMainWindow } from "@/utils/window"
	import { listenToKillProcessEvent, listenToRecordExtensionProcessEvent } from "@kksh/api/events"
	import { Constants, ViewTransition } from "@kksh/ui"
	import type { UnlistenFn } from "@tauri-apps/api/event"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { attachConsole, error, info } from "@tauri-apps/plugin-log"
	import { afterNavigate, beforeNavigate } from "$app/navigation"
	import { gsap } from "gsap"
	import { Flip } from "gsap/Flip"
	import { onDestroy, onMount } from "svelte"
	import { toast, Toaster } from "svelte-sonner"
	import * as shellx from "tauri-plugin-shellx-api"

	/* -------------------------------------------------------------------------- */
	/*                             Gsap Flip Animation                            */
	/* -------------------------------------------------------------------------- */
	gsap.registerPlugin(Flip)
	let flipState: Flip.FlipState
	beforeNavigate(() => {
		flipState = Flip.getState(
			`.${Constants.CLASSNAMES.EXT_LOGO}, .${Constants.CLASSNAMES.BACK_BUTTON}`
		)
	})

	afterNavigate(() => {
		if (!flipState) {
			return
		}

		Flip.from(flipState, {
			targets: `.${Constants.CLASSNAMES.EXT_LOGO}, .${Constants.CLASSNAMES.BACK_BUTTON}`,
			duration: 0.5,
			absolute: true,
			scale: true,
			ease: "ease-out"
		})
	})

	let { children } = $props()
	const unlisteners: UnlistenFn[] = []
	onDestroy(() => {
		unlisteners.forEach((unlistener) => unlistener())
	})
	onMount(async () => {
		console.log("root layout onMount")

		attachConsole().then((unlistener) => unlisteners.push(unlistener))
		initDeeplink().then((unlistener) => unlisteners.push(unlistener))
		shellx
			.fixPathEnv()
			.then(() => {
				info("fixed path env")
			})
			.catch(error)

		quickLinks.init()
		appConfig.init()
		if (isInMainWindow()) {
			if ($appConfig.triggerHotkey) {
				updateAppHotkey($appConfig.triggerHotkey)
			}
			unlisteners.push(
				await listenToWindowBlur(() => {
					const win = getCurrentWebviewWindow()
					win.isFocused().then((isFocused) => {
						// this extra is focused check may be needed because blur event got triggered somehow when window show()
						// for edge case: when settings page is opened and focused, switch to main window, the blur event is triggered for main window
						if (!isFocused) {
							if ($appConfig.hideOnBlur) {
								win.hide()
							}
						}
					})
				})
			)
			extensions.init()
			unlisteners.push(
				await listenToRecordExtensionProcessEvent(async (event) => {
					console.log("record extension process event", event)
					winExtMap.registerProcess(event.payload.windowLabel, event.payload.pid)
				})
			)
			unlisteners.push(
				await listenToKillProcessEvent((event) => {
					console.log("kill process event", event)
					winExtMap.unregisterProcess(event.payload.pid)
				})
			)
		} else {
		}
		getCurrentWebviewWindow().show()
	})
</script>

<svelte:window on:keydown={globalKeyDownHandler} />
<ViewTransition />
<Toaster richColors />
<AppContext {appConfig} {appState}>
	{@render children()}
</AppContext>
