<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import Markdown from "../../markdown/Markdown.svelte"

	const { markdown, class: className }: { markdown: string; class?: string } = $props()
</script>

<div class={cn("prose dark:prose-invert", className)}>
	<Markdown md={markdown} />
</div>
