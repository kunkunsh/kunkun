<script lang="ts">
	import AppContext from "@/components/context/AppContext.svelte"
	import "../app.css"
	import { appConfig, appState, extensions, quickLinks } from "@/stores"
	import { initDeeplink } from "@/utils/deeplink"
	import { globalKeyDownHandler } from "@/utils/key"
	import { isInMainWindow } from "@/utils/window"
	import {
		ModeWatcher,
		themeConfigStore,
		ThemeWrapper,
		Toaster,
		updateTheme,
		type ThemeConfig
	} from "@kksh/svelte5"
	import { ViewTransition } from "@kksh/ui"
	import type { UnlistenFn } from "@tauri-apps/api/event"
	import { attachConsole } from "@tauri-apps/plugin-log"
	import { onDestroy, onMount } from "svelte"

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
