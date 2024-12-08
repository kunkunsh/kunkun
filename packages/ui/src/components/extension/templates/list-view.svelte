<script lang="ts">
	import { ListSchema } from "@kksh/api/models"
	import { Button, Command, Progress, Resizable } from "@kksh/svelte5"
	import { CustomCommandInput } from "@kksh/ui/main"
	import { commandScore } from "@kksh/ui/utils"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { type PaneAPI } from "paneforge"
	import { onMount, type Snippet } from "svelte"
	import { StrikeSeparator } from "../../common"
	import { DraggableCommandGroup } from "../../custom"
	import ListDetail from "./list-detail.svelte"
	import ListItem from "./list-item.svelte"

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
		onHighlightedItemChanged?: (value: string) => void
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

	const detailWidth = $derived(listViewContent.detail ? (listViewContent.detail?.width ?? 70) : 0)

	export function inputFocus() {
		inputRef?.focus()
	}

	export function setHighlightedValue(value: string) {
		highlightedValue = value
	}

	$effect(() => {
		if (highlightedValue.startsWith("{")) {
			onHighlightedItemChanged?.(JSON.parse(highlightedValue).value)
		}
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
</script>

<Command.Root
	class="h-screen w-full rounded-lg border shadow-md"
	shouldFilter={listViewContent.filter !== "none"}
	bind:value={highlightedValue}
	loop
	filter={(value, search, keywords) => {
		if (!value.startsWith("{")) {
			return -1
		}
		const item = JSON.parse(value) as ListSchema.Item
		return (
			commandScore(item.title, search, keywords) +
			(item.subTitle ? commandScore(item.subTitle, search, keywords) : 0)
		)
	}}
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
		<Progress value={50} class="h-0.4 rounded-none" />
	{/if}

	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane bind:this={leftPane}>
			<Command.List class="h-full max-h-screen" onscroll={onScroll}>
				<Command.Empty>No results found.</Command.Empty>
				{#each listViewContent.sections || [] as section}
					<DraggableCommandGroup heading={section.title}>
						{#each section.items as item}
							<ListItem {item} onSelect={() => onListItemSelected?.(item.value)} />
						{/each}
					</DraggableCommandGroup>
				{/each}
				{#each listViewContent.items || [] as item}
					<ListItem {item} onSelect={() => onListItemSelected?.(item.value)} />
				{/each}
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
