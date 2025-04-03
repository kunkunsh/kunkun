<!-- Don't Load All languages and themes, use fine-grained bundle-->
<!-- https://shiki.style/guide/bundles#fine-grained-bundle -->
<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { ShikiMagicMove } from "shiki-magic-move/svelte"
	import "shiki-magic-move/dist/style.css"
	import { createHighlighterCore } from "shiki/core"
	import { createOnigurumaEngine } from "shiki/engine/oniguruma"

	const {
		code,
		lang,
		theme,
		lineNumbers,
		class: className
	}: {
		code: string
		lang: "json" | "typescript" | "bash" | "powershell"
		theme?: "vitesse-dark" | "vitesse-light"
		lineNumbers?: boolean
		class?: string
	} = $props()

	const highlighter2 = createHighlighterCore({
		themes: [import("@shikijs/themes/vitesse-dark"), import("@shikijs/themes/vitesse-light")],
		langs: [
			import("@shikijs/langs/json"),
			import("@shikijs/langs/typescript"),
			import("@shikijs/langs/bash"),
			import("@shikijs/langs/powershell")
		],
		// `shiki/wasm` contains the wasm binary inlined as base64 string.
		engine: createOnigurumaEngine(import("shiki/wasm"))
	})
</script>

{#await highlighter2 then highlighter}
	<ShikiMagicMove
		class={cn("p-3", className)}
		{lang}
		theme={theme ?? "vitesse-dark"}
		{highlighter}
		{code}
		options={{ duration: 800, stagger: 0.3, lineNumbers: lineNumbers ?? false }}
	/>
{/await}
