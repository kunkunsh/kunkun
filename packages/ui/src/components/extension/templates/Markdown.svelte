<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import SvelteMarkdown from "svelte-markdown"

	const { markdown, class: className }: { markdown: string; class?: string } = $props()
</script>

<div class={cn("prose dark:prose-invert", className)}>
	<SvelteMarkdown source={markdown} />
</div>
