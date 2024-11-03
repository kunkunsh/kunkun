<script lang="ts">
	import { setAppConfigContext } from "@/context"
	import { setAppStateContext } from "@/context/appState"
	import type { AppConfig, AppState } from "@kksh/types"
	import type { Snippet } from "svelte"
	import type { Writable } from "svelte/store"

	const {
		appConfig,
		appState,
		children
	}: {
		appConfig: Writable<AppConfig>
		appState: Writable<AppState>
		children: Snippet<[]>
	} = $props()

	setAppConfigContext(appConfig)
	setAppStateContext(appState)
</script>

{@render children?.()}
