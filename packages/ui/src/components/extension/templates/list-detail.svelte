<script lang="ts">
	import { ListSchema, MarkdownSchema, NodeNameEnum } from "@kksh/api/ui/worker"
	import Markdown from "./Markdown.svelte"
	import Metadata from './metadata/Metadata.svelte'

	const { detail }: { detail: ListSchema.ItemDetail } = $props()
</script>
{#each detail.children as child}
	{#if child.nodeName === NodeNameEnum.Markdown}
		<Markdown markdown={(child as MarkdownSchema).content} />
	{:else if child.nodeName === NodeNameEnum.ListItemDetailMetadata}
		<Metadata items={(child as ListSchema.ItemDetailMetadata).items} />
	{:else}
		<div>Unhandled Component</div>
	{/if}
{/each}
