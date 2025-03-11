<script lang="ts">
	import rehypeShikiFromHighlighter from "@shikijs/rehype/core"
	import rehypeClassNames from "rehype-class-names"
	import rehypeKatex from "rehype-katex"
	import remarkMath from "remark-math"
	import { createHighlighterCoreSync } from "shiki/core"
	import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
	import html from "shiki/langs/html.mjs"
	import json from "shiki/langs/json.mjs"
	import rust from "shiki/langs/rust.mjs"
	import svelte from "shiki/langs/svelte.mjs"
	import ts from "shiki/langs/typescript.mjs"
	import vitesseDark from "shiki/themes/vitesse-dark.mjs"
	import Markdown from "svelte-exmarkdown"
	import type { Plugin } from "svelte-exmarkdown"
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
				langs: [ts, svelte, json, html, rust],
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
