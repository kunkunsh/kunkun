<script lang="ts">
	import type { Color, ListSchema } from "@kksh/api/ui/worker"
	import Tag from "./tag.svelte"

	const {
		tags,
		title
	}: {
		tags: Array<{ text?: string; color?: Color }>
		title: string
	} = $props()
</script>

<div class="flex justify-between gap-1 py-1">
	<span class="text-muted-foreground text-sm font-semibold">{title}</span>
	<span class="flex gap-1">
		{#each tags as tag}
			<Tag text={tag.text} color={tag.color} />
		{/each}
	</span>
</div>
