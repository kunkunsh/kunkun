<script lang="ts">
	import {
		List,
		ListSchema,
		MarkdownSchema,
		NodeNameEnum,
		WorkerExtension
	} from "@kksh/api/ui/worker"
	import { Separator } from "@kksh/svelte5"
	import Label from "./label.svelte"
	import Link from "./link.svelte"
	import Tags from "./tags.svelte"

	const { items }: { items: ListSchema.ItemDetailMetadataItem[] } = $props()
</script>

<div class="px-3">
	{#each items as item}
		{#if item.nodeName === NodeNameEnum.ListItemDetailMetadataLabel}
			<Label
				title={(item as ListSchema.ItemDetailMetadataLabel).title}
				text={(item as ListSchema.ItemDetailMetadataLabel).text}
				icon={(item as ListSchema.ItemDetailMetadataLabel).icon}
			/>
		{/if}
		{#if item.nodeName === NodeNameEnum.ListItemDetailMetadataSeparator}
			<Separator />
		{/if}
		{#if item.nodeName === NodeNameEnum.ListItemDetailMetadataLink}
			<Link
				title={(item as ListSchema.ItemDetailMetadataLink).title}
				text={(item as ListSchema.ItemDetailMetadataLink).text}
				url={(item as ListSchema.ItemDetailMetadataLink).url}
			/>
		{/if}
		{#if item.nodeName === NodeNameEnum.ListItemDetailMetadataTagList}
			<Tags
				tags={(item as ListSchema.ItemDetailMetadataTagList).tags}
				title={(item as ListSchema.ItemDetailMetadataTagList).title}
			/>
		{/if}
	{/each}
</div>
