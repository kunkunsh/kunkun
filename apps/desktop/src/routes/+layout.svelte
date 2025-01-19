<script lang="ts">
	import { ParaglideJS } from "@inlang/paraglide-sveltekit"
	import { i18n } from "$lib/i18n"
	import { onMount } from "svelte"
	import "../app.css"
	import { init } from "@/utils/init"
	import { ModeWatcher, ThemeWrapper } from "@kksh/svelte5"
	import { Toaster } from "svelte-sonner"

	onMount(() => {
		init()
	})

	let { children } = $props()
</script>

<ParaglideJS {i18n}>
	<ModeWatcher />
	<Toaster richColors closeButton />
	<ThemeWrapper>
		{@render children()}
	</ThemeWrapper>
</ParaglideJS>
