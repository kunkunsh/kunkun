<script lang="ts">
	import { MarkdownSchema } from "@kksh/api/models"
	import { Button } from "@kksh/svelte5"
	import { ArrowLeftIcon } from "lucide-svelte"
	import Markdown from "./Markdown.svelte"

	const {
		markdownViewContent,
		onGoBack
	}: {
		markdownViewContent: MarkdownSchema
		onGoBack?: () => void
	} = $props()
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "Escape") {
			onGoBack?.()
		}
	}}
/>
<Button class="fixed left-2 top-2" onclick={onGoBack} variant="outline" size="icon">
	<ArrowLeftIcon />
</Button>
<div class="h-12" data-tauri-drag-region></div>
<main class="container px-12">
	<Markdown markdown={markdownViewContent.content} />
</main>
