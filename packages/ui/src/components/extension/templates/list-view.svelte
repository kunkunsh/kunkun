<script lang="ts">
	import { ListSchema } from "@kksh/api/models"
	import { Button, Command, Progress, Resizable } from "@kksh/svelte5"
	import { CustomCommandInput } from "@kksh/ui/main"
	import { commandScore } from "@kksh/ui/utils"
	import { createVirtualizer, type VirtualItem } from "@tanstack/svelte-virtual"
	import Fuse from "fuse.js"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { type PaneAPI } from "paneforge"
	import { onMount, setContext, type Snippet } from "svelte"
	import { Inspect } from "svelte-inspect-value"
	import { StrikeSeparator } from "../../common"
	import { DraggableCommandGroup } from "../../custom"
	import ListDetail from "./list-detail.svelte"
	import ListItem from "./list-item.svelte"
	import { type Section } from "./types"
	import VirtualCommandGroup from "./virtual-command-group.svelte"

	let {
		searchTerm = $bindable(""),
		searchBarPlaceholder = $bindable(""),
		inputRef = $bindable<HTMLInputElement | null>(null),
		pbar,
		highlightedValue = $bindable<string>(""),
		onGoBack,
		onListScrolledToBottom,
		onEnterKeyPressed,
		onListItemSelected,
		onSearchTermChange,
		footer,
		onHighlightedItemChanged,
		loading,
		listViewContent
	}: {
		searchTerm: string
		searchBarPlaceholder: string
		inputRef?: HTMLInputElement | null
		pbar: number | null
		highlightedValue?: string
		onGoBack?: () => void
		onListScrolledToBottom?: () => void
		onEnterKeyPressed?: () => void
		onListItemSelected?: (value: string) => void
		onSearchTermChange?: (searchTerm: string) => void
		onHighlightedItemChanged?: (item: ListSchema.Item) => void
		footer: Snippet
		loading: boolean
		listViewContent: ListSchema.List
	} = $props()
	let leftPane: PaneAPI | undefined
	let rightPane: PaneAPI | undefined
	let isScrolling = $state(false)
	let privateSearchTerm = $state("")
	// let detailWidth = $derived()
	let prevDetailWidth = $state(0)

	// let detailWidth = 0
	let detailWidth = $derived(listViewContent?.detail ? (listViewContent.detail?.width ?? 70) : 0)

	export function inputFocus() {
		inputRef?.focus()
	}

	export function setHighlightedValue(value: string) {
		highlightedValue = value
	}

	$effect(() => {
		// find the item whose value is equal to highlightedValue, also search sections
		const item = listViewContent.items?.find((item) => item.value === highlightedValue)
		if (item) {
			onHighlightedItemChanged?.(item)
			return
		}
		for (const section of listViewContent.sections ?? []) {
			const item = section.items?.find((item) => item.value === highlightedValue)
			if (item) {
				onHighlightedItemChanged?.(item)
				return
			}
		}
		// if (highlightedValue.startsWith("{")) {
		// 	onHighlightedItemChanged?.(highlightedValue)
		// }
	})

	$effect(() => {
		onSearchTermChange?.(searchTerm)
	})

	function onScroll(e: Event) {
		const element = e.target as HTMLElement
		if (!isScrolling && element?.scrollHeight - element?.scrollTop === element?.clientHeight) {
			isScrolling = true
			onListScrolledToBottom?.()
			setTimeout(() => {
				isScrolling = false
			}, 500)
		}
	}

	$effect(() => {
		if (detailWidth != prevDetailWidth) {
			// this watches width update from extension, when pane is resized manually, this will not trigger
			prevDetailWidth = detailWidth
			rightPane?.resize(detailWidth)
		}
	})

	/* -------------------------------------------------------------------------- */
	/*                        Virtual List and Fuse Search                        */
	/* -------------------------------------------------------------------------- */
	const itemHeight = 30
	setContext("itemHeight", itemHeight)
	let sectionItems = $derived<ListSchema.Item[]>(
		listViewContent.sections?.flatMap((section) => section.items) ?? []
	)
	/**
	 * When search term is not empty, we hide sections/groups and move sections items all into items array
	 */
	let srcItems = $derived<ListSchema.Item[]>(
		searchTerm.length > 0
			? [...sectionItems, ...(listViewContent.items ?? [])]
			: (listViewContent.items ?? [])
	)
	let srcSections = $state<Section[]>([])
	$effect(() => {
		//! srcSections cannot be derived, because its values are binded to Virtual Group, and must be a state
		srcSections =
			searchTerm.length === 0
				? (listViewContent.sections?.map((section) => ({
						...section,
						sectionHeight: 0,
						sectionRef: null
					})) ?? [])
				: []
	})
	let virtualListEl: HTMLDivElement | null = $state(null)
	const itemsFuse = new Fuse<ListSchema.Item>([], {
		includeScore: true,
		threshold: 0.2,
		keys: ["title", "subTitle", "keywords"]
	})
	let resultingItems = $derived<ListSchema.Item[]>(
		// when search term changes, update the resulting items
		listViewContent.filter === "none"
			? (listViewContent.items ?? [])
			: searchTerm.length > 0
				? itemsFuse.search(searchTerm).map((item) => item.item)
				: srcItems
	)
	// section total height is auto derived from section refs
	let sectionTotalHeight = $derived(srcSections.reduce((acc, s) => acc + (s.sectionHeight ?? 0), 0))
	// this should be a list of numbers, the first item is 0, the second item equal to first sectionRef.clientHeight, and so on
	let sectionsCummulativeHeight = $derived(
		srcSections.map((s, i) =>
			srcSections.slice(0, i).reduce((acc, s) => acc + (s.sectionHeight ?? 0), 0)
		)
	)
	let virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
		count: 0,
		getScrollElement: () => virtualListEl,
		estimateSize: () => itemHeight,
		overscan: 5
	})
	let virtualItems: VirtualItem[] = $state([])
	let itemsTotalSize = $state(0)

	$effect(() => {
		itemsFuse.setCollection(srcItems)
	})
	$effect(() => {
		void resultingItems
		$virtualizer.setOptions({ count: resultingItems.length, scrollMargin: sectionTotalHeight })
		virtualItems = $virtualizer.getVirtualItems()
		itemsTotalSize = $virtualizer.getTotalSize()
	})
</script>

<Command.Root
	vimBindings={false}
	class="h-screen w-full rounded-lg border shadow-md"
	bind:value={highlightedValue}
	loop
	shouldFilter={false}
>
	<CustomCommandInput
		bind:value={searchTerm}
		placeholder={searchBarPlaceholder}
		autofocus
		bind:ref={inputRef}
		onkeydown={(e) => {
			if (e.key === "Enter") {
				e.preventDefault()
				onEnterKeyPressed?.()
			} else if (e.key === "Escape") {
				e.preventDefault()
				if (searchTerm.length > 0) {
					searchTerm = ""
				} else {
					onGoBack?.()
				}
			}
		}}
	>
		{#snippet leftSlot()}
			<Button variant="outline" size="icon" onclick={onGoBack}>
				<ArrowLeftIcon class="h-4 w-4" />
			</Button>
		{/snippet}
	</CustomCommandInput>
	{#if pbar}
		<Progress value={pbar} class="h-0.5 rounded-none" />
	{/if}

	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane bind:this={leftPane}>
			<Command.List class="h-full max-h-screen" onscroll={onScroll} bind:ref={virtualListEl}>
				<Command.Empty>No results found.</Command.Empty>
				<div
					style="position: relative; height: {itemsTotalSize + sectionTotalHeight}px; width: 100%;"
					class=""
				>
					{#each srcSections as section, i}
						<VirtualCommandGroup
							filterMode={listViewContent.filter}
							heading={section.title ?? ""}
							items={section.items}
							parentRef={virtualListEl}
							bind:sectionRef={section.sectionRef}
							scrollMargin={sectionsCummulativeHeight[i] ?? 0}
							bind:sectionHeight={section.sectionHeight}
							{searchTerm}
							{onListItemSelected}
						/>
					{/each}
					{#each virtualItems as row (row.index)}
						{@const item = resultingItems[row.index]}
						{#if item}
							<ListItem
								height={row.size}
								translateY={row.start}
								{item}
								onSelect={() => onListItemSelected?.(item.value)}
							/>
						{:else}
							<Command.Item>
								<span>No Data</span>
							</Command.Item>
						{/if}
					{/each}
				</div>
				{#if loading}
					<StrikeSeparator class="h-20">
						<span>Loading</span>
					</StrikeSeparator>
				{/if}
			</Command.List>
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={detailWidth} bind:this={rightPane}>
			{#if listViewContent.detail}
				<ListDetail detail={listViewContent.detail} />
			{/if}
		</Resizable.Pane>
	</Resizable.PaneGroup>
	{@render footer?.()}
</Command.Root>
