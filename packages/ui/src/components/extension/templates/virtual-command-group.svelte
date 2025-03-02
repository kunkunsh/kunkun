<script lang="ts">
	import { ListSchema } from "@kksh/api/models"
	import { createVirtualizer, type VirtualItem } from "@tanstack/svelte-virtual"
	import Fuse from "fuse.js"
	import { getContext } from "svelte"
	import { DraggableCommandGroup } from "../../custom"
	import ListItem from "./list-item.svelte"

	let {
		heading,
		filterMode,
		items,
		parentRef,
		searchTerm,
		sectionHeight = $bindable(0),
		sectionRef = $bindable(null),
		scrollMargin = $bindable(0),
		onListItemSelected
	}: {
		heading: string
		filterMode: "none" | "default"
		items: ListSchema.Item[]
		sectionHeight: number
		searchTerm: string
		parentRef: HTMLDivElement | null
		sectionRef: HTMLDivElement | null
		scrollMargin: number
		onListItemSelected?: (value: string) => void
	} = $props()

	const fuse = new Fuse(items, {
		includeScore: true,
		threshold: 0.2,
		keys: ["title", "subTitle", "keywords"]
	})

	const itemHeight = getContext<number>("itemHeight") ?? 30

	let virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
		count: items.length,
		getScrollElement: () => parentRef,
		estimateSize: () => itemHeight,
		overscan: 5
	})
	let virtualItems: VirtualItem[] = $state([])
	let itemsTotalSize = $state(0)

	let resultingItems = $derived(
		// when search term changes, update the resulting items
		filterMode === "none"
			? items
			: searchTerm.length > 0
				? fuse.search(searchTerm).map((item) => item.item)
				: items
	)

	$effect(() => {
		// when props.items update, update the fuse collection
		fuse.setCollection(items)
	})

	$effect(() => {
		// when resultingItems changes, update virtualizer count and scrollMargin
		$virtualizer.setOptions({ count: resultingItems.length, scrollMargin })
		virtualItems = $virtualizer.getVirtualItems()
		itemsTotalSize = $virtualizer.getTotalSize()
	})
	$effect(() => {
		sectionHeight = itemsTotalSize + itemHeight
	})
</script>

<DraggableCommandGroup
	heading={`${heading} (${items.length})`}
	bind:ref={sectionRef}
	class="relative"
	style="height: {sectionHeight}px;"
>
	{#each virtualItems as row (row.index)}
		{@const item = resultingItems[row.index]}
		{#if item}
			<ListItem
				height={row.size}
				translateY={row.start - scrollMargin + itemHeight}
				{item}
				onSelect={() => onListItemSelected?.(item.value)}
			/>
		{/if}
	{/each}
</DraggableCommandGroup>
