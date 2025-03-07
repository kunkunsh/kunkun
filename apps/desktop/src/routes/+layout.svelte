<script lang="ts">
	import { ParaglideJS } from "@inlang/paraglide-sveltekit"
	import { i18n } from "$lib/i18n"
	import "../app.css"
	import FullScreenLoading from "@/components/common/FullScreenLoading.svelte"
	import { appState } from "@/stores/appState"
	import { ModeWatcher, ThemeWrapper } from "@kksh/svelte5"
	import { Toaster } from "svelte-sonner"

	let { children } = $props()
</script>

<ParaglideJS {i18n}>
	<ModeWatcher />
	<Toaster richColors closeButton />
	<ThemeWrapper>
		{#if $appState.fullScreenLoading}
			<FullScreenLoading class="bg-background absolute inset-0 z-50" />
		{/if}
		{@render children()}
	</ThemeWrapper>
</ParaglideJS>
