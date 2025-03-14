<script lang="ts">
	import rehypeShikiFromHighlighter from "@shikijs/rehype/core"
	import rehypeClassNames from "rehype-class-names"
	import rehypeKatex from "rehype-katex"
	import rehypeRaw from "rehype-raw"
	import remarkMath from "remark-math"
	import { createHighlighterCoreSync } from "shiki/core"
	import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
	import bash from "shiki/langs/bash.mjs"
	import cpp from "shiki/langs/cpp.mjs"
	import csharp from "shiki/langs/csharp.mjs"
	import go from "shiki/langs/go.mjs"
	import html from "shiki/langs/html.mjs"
	import java from "shiki/langs/java.mjs"
	import json from "shiki/langs/json.mjs"
	import kotlin from "shiki/langs/kotlin.mjs"
	import markdown from "shiki/langs/markdown.mjs"
	import php from "shiki/langs/php.mjs"
	import python from "shiki/langs/python.mjs"
	import ruby from "shiki/langs/ruby.mjs"
	import rust from "shiki/langs/rust.mjs"
	import shell from "shiki/langs/shell.mjs"
	import svelte from "shiki/langs/svelte.mjs"
	import swift from "shiki/langs/swift.mjs"
	import ts from "shiki/langs/typescript.mjs"
	import yaml from "shiki/langs/yaml.mjs"
	import githubDarkDefault from "shiki/themes/github-dark-default.mjs"
	import Markdown from "svelte-exmarkdown"
	import type { Plugin } from "svelte-exmarkdown"
	import { gfmPlugin } from "svelte-exmarkdown/gfm"
	import A from "./A.svelte"
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
				themes: [githubDarkDefault],
				langs: [
					ts,
					svelte,
					json,
					html,
					rust,
					python,
					java,
					cpp,
					csharp,
					go,
					ruby,
					php,
					markdown,
					kotlin,
					swift,
					yaml,
					shell,
					bash
				],
				engine: createJavaScriptRegexEngine()
			}),
			{
				theme: "github-dark-default"
			}
		]
	} satisfies Plugin

	const plugins: Plugin[] = [
		shikiPlugin,
		gfmPlugin(),
		{ rehypePlugin: [rehypeRaw] },
		{ remarkPlugin: [remarkMath], rehypePlugin: [rehypeKatex] },
		addClass,
		{ renderer: { pre: Pre, a: A } }
	]

	let { md }: { md: string } = $props()
</script>

<Markdown {md} {plugins} />
