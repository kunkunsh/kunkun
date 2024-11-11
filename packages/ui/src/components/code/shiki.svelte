<!-- Don't Load All languages and themes, use fine-grained bundle-->
<!-- https://shiki.style/guide/bundles#fine-grained-bundle -->
<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { mode } from "mode-watcher"
	import { createHighlighterCore, type HighlighterCore } from "shiki/core"
	import { createOnigurumaEngine } from "shiki/engine/oniguruma"
	import { onMount } from "svelte"

	const {
		code,
		lang,
		theme,
		class: className
	}: {
		code: string
		lang: "json" | "typescript"
		theme?: "vitesse-dark" | "vitesse-light"
		class?: string
	} = $props()
	let html = $state("")
	let highlighter: HighlighterCore

	function refresh() {
		html = highlighter.codeToHtml(code, {
			lang,
			theme: theme ?? ($mode === "dark" ? "vitesse-dark" : "vitesse-light")
		})
	}
	onMount(async () => {
		highlighter = await createHighlighterCore({
			themes: [import("shiki/themes/vitesse-dark.mjs"), import("shiki/themes/vitesse-light.mjs")],
			langs: [import("shiki/langs/json.mjs"), import("shiki/langs/typescript.mjs")],
			engine: createOnigurumaEngine(import("shiki/wasm"))
		})
		refresh()
	})

	$effect(() => {
		code // keep this here to watch for code changes
		highlighter
		if (highlighter) {
			refresh()
		}
	})
</script>

<div class={cn("", className)}>
	{@html html}
</div>
