<script lang="ts">
	import { ParaglideJS } from "@inlang/paraglide-sveltekit"
	import { i18n } from "$lib/i18n"
	import "../app.css"
	import { ModeWatcher, ThemeWrapper } from "@kksh/svelte5"
	import { Toaster } from "svelte-sonner"

	let { children } = $props()
</script>

<ParaglideJS {i18n}>
	<ModeWatcher />
	<Toaster richColors closeButton />
	<ThemeWrapper>
		{@render children()}
	</ThemeWrapper>
</ParaglideJS>
