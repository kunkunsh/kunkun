<script lang="ts">
	import {
		FormNodeNameEnum,
		FormSchema,
		ListSchema,
		type IComponent,
		type IDb,
		type WorkerExtension
	} from "@kksh/api/ui/worker"
	import { Button, Command, Progress, Resizable } from "@kksh/svelte5"
	import { CustomCommandInput, GlobalCommandPaletteFooter } from "@kksh/ui/main"
	import { commandScore } from "@kksh/ui/utils"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { type PaneAPI } from "paneforge"
	import { onMount, type Snippet } from "svelte"
	import { StrikeSeparator } from "../../common"
	import ListDetail from "./list-detail.svelte"
	import ListItem from "./list-item.svelte"

	let {
		searchTerm = $bindable(""),
		searchBarPlaceholder = $bindable(""),
		pbar,
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
		pbar: number | null
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
	let mounted = $state(false)
	let leftPane: PaneAPI | undefined
	let rightPane: PaneAPI | undefined
	let isScrolling = $state(false)
	let highlightedValue = $state<string>("")
	let privateSearchTerm = $state("")
	// let detailWidth = $derived()
	let prevDetailWidth = $state(0)

	const detailWidth = $derived(listViewContent.detail ? (listViewContent.detail?.width ?? 70) : 0)

	function internalOnHighlightedItemChanged(value: string) {
		onHighlightedItemChanged?.(value)
		if (listViewContent.actions) {
			// 	appUiStore.setActionPanel(props.modelValue.actions)
		} else {
			// 	appUiStore.setActionPanel(item?.actions)
		}
		if (listViewContent.defaultAction) {
			// 	appUiStore.setDefaultAction(props.modelValue.defaultAction)
		} else {
			// 	appUiStore.setDefaultAction(item?.defaultAction)
		}
	}

	$effect(() => {
		internalOnHighlightedItemChanged(highlightedValue)
	})

	$effect(() => {
		if (privateSearchTerm !== searchTerm) {
			onSearchTermChange?.(privateSearchTerm)
		}
	})

	function onScroll(e: Event) {
		const element = e.target as HTMLElement
		if (!isScrolling && element?.scrollHeight - element?.scrollTop === element?.clientHeight) {
			isScrolling = true
			console.log("onListScrolledToBottom")
			onListScrolledToBottom?.()
			setTimeout(() => {
				isScrolling = false
			}, 500)
		}
	}

	$effect(() => {
		if (detailWidth != prevDetailWidth) {
			console.log("detailWidth changed from ", prevDetailWidth, "to", detailWidth)
			prevDetailWidth = detailWidth
			rightPane?.resize(detailWidth)
			// rightPane?.resize(detailWidth)
		}
	})
</script>

<Command.Root
	class="h-screen w-full rounded-lg border shadow-md"
	shouldFilter={listViewContent.filter !== "none"}
	bind:value={highlightedValue}
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
		bind:value={privateSearchTerm}
		placeholder={searchBarPlaceholder}
		autofocus
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
		<Progress value={pbar} class="h-[1.5px] rounded-none" />
	{/if}

	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane bind:this={leftPane}>
			<Command.List class="max-h-screen grow" onscroll={onScroll}>
				<Command.Empty>No results found.</Command.Empty>
				{#each listViewContent.sections || [] as section}
					<Command.Group heading={section.title}>
						{#each section.items as item}
							<ListItem {item} />
						{/each}
					</Command.Group>
				{/each}
				{#each listViewContent.items || [] as item}
					<ListItem
						{item}
						onSelect={() => {
							onListItemSelected?.(item.value)
						}}
					/>
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
