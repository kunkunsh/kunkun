<script lang="ts">
	import Markdown from "svelte-exmarkdown"
	import type { Plugin } from "svelte-exmarkdown"
	import rehypeShikiFromHighlighter from "@shikijs/rehype/core"
	import { createHighlighterCoreSync } from "shiki/core"
	import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
	import ts from "shiki/langs/typescript.mjs"
	import svelte from "shiki/langs/svelte.mjs"
	import vitesseDark from "shiki/themes/vitesse-dark.mjs"
	import rehypeKatex from "rehype-katex"
	import remarkMath from "remark-math"
	import rehypeClassNames from "rehype-class-names"
	import Pre from "./Pre.svelte"

	const addClass: Plugin = {
		rehypePlugin: [
			rehypeClassNames,
			{
				pre: "p-4 rounded-md overflow-auto"
			}
		]
	}

	const shikiPlugin = {
		rehypePlugin: [
			rehypeShikiFromHighlighter,
			createHighlighterCoreSync({
				themes: [vitesseDark],
				langs: [ts, svelte],
				engine: createJavaScriptRegexEngine()
			}),
			{
				theme: "vitesse-dark"
			}
		]
	} satisfies Plugin

	const plugins: Plugin[] = [
		shikiPlugin,
		{ remarkPlugin: [remarkMath], rehypePlugin: [rehypeKatex] },
		addClass,
		{ renderer: { pre: Pre } }
	]

	let { md }: { md: string } = $props()
</script>

<Markdown {md} {plugins} />
