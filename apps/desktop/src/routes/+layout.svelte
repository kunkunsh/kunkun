<script lang="ts">
	import AppContext from "@/components/context/AppContext.svelte"
	import "../app.css"
	import { appConfig, appState, extensions, quickLinks } from "@/stores"
	import { initDeeplink } from "@/utils/deeplink"
	import { globalKeyDownHandler, goBackOrCloseOnEscape } from "@/utils/key"
	import { isInMainWindow } from "@/utils/window"
	import {
		ModeWatcher,
		themeConfigStore,
		ThemeWrapper,
		Toaster,
		updateTheme,
		type ThemeConfig
	} from "@kksh/svelte5"
	import { Constants, ViewTransition } from "@kksh/ui"
	import type { UnlistenFn } from "@tauri-apps/api/event"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { attachConsole } from "@tauri-apps/plugin-log"
	import { afterNavigate, beforeNavigate } from "$app/navigation"
	import { gsap } from "gsap"
	import { Flip } from "gsap/Flip"
	import { onDestroy, onMount } from "svelte"

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

	onMount(async () => {
		attachConsole().then((unlistener) => unlisteners.push(unlistener))
		initDeeplink().then((unlistener) => unlisteners.push(unlistener))
		quickLinks.init()
		appConfig.init()
		if (isInMainWindow()) {
			extensions.init()
		} else {
		}
		getCurrentWebviewWindow().show()
	})

	onDestroy(() => {
		unlisteners.forEach((unlistener) => unlistener())
	})
</script>

<svelte:window on:keydown={globalKeyDownHandler} />
<ViewTransition />
<ModeWatcher />
<Toaster richColors />
<AppContext {appConfig} {appState}>
	<ThemeWrapper>
		{@render children()}
	</ThemeWrapper>
</AppContext>
