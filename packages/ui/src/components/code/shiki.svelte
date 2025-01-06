<!-- Don't Load All languages and themes, use fine-grained bundle-->
<!-- https://shiki.style/guide/bundles#fine-grained-bundle -->
<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { getSingletonHighlighter } from "shiki"
	import { ShikiMagicMove } from "shiki-magic-move/svelte"
	import "shiki-magic-move/dist/style.css"

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

	const highlighter2 = getSingletonHighlighter({
		themes: ["vitesse-dark", "vitesse-light"],
		langs: ["typescript", "bash", "powershell", "json"]
	})

	let code2 = $state(`const hello = 'world'`)
</script>

{#await highlighter2 then highlighter}
	<ShikiMagicMove
		class={cn("", className)}
		{lang}
		theme={theme ?? "vitesse-dark"}
		{highlighter}
		{code}
		options={{ duration: 800, stagger: 0.3, lineNumbers: lineNumbers ?? false }}
	/>
{/await}
