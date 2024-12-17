<script lang="ts">
	import { goBack, goHome } from "@/utils/route"
	import Icon from "@iconify/svelte"
	import { db } from "@kksh/api/commands"
	import { SQLSortOrderEnum, type ExtData } from "@kksh/api/models"
	import { Button, Command, Resizable } from "@kksh/svelte5"
	import { Constants } from "@kksh/ui"
	import { CustomCommandInput, GlobalCommandPaletteFooter } from "@kksh/ui/main"
	import { ArrowLeft, FileQuestionIcon, ImageIcon, LetterTextIcon } from "lucide-svelte"
	import { onMount, type Snippet } from "svelte"
	import ContentPreview from "./content-preview.svelte"

	let searchTerm = $state("")
	let clipboardHistory = $state<ExtData[]>([])
	let highlightedStr = $state<string>("")
	let highlighted = $state<ExtData | null>(null)

	onMount(async () => {
		const result = await db.searchExtensionData({
			extId: 1,
			searchExactMatch: false,
			limit: 50,
			// offset: 0,
			fields: ["search_text"],
			orderByCreatedAt: SQLSortOrderEnum.Desc
		})
		clipboardHistory = result
	})

	$effect(() => {
		if (!highlightedStr) {
			return
		}
		try {
			const parsed = JSON.parse(highlightedStr)
			highlighted = parsed
		} catch (error) {
			console.error(error)
		}
	})
</script>

{#snippet leftSlot()}
	<Button
		variant="outline"
		size="icon"
		onclick={goHome}
		class={Constants.CLASSNAMES.BACK_BUTTON}
		data-flip-id={Constants.CLASSNAMES.BACK_BUTTON}
	>
		<ArrowLeft class="size-4" />
	</Button>
{/snippet}
{#snippet typeIcon(type: string)}
	{#if type === "Text"}
		<LetterTextIcon />
	{:else if type === "Html"}
		<Icon icon="skill-icons:html" />
	{:else if type === "Image"}
		<ImageIcon />
	{:else}
		<FileQuestionIcon />
	{/if}
{/snippet}

<!-- <pre>{JSON.stringify(highlightedStr, null, 2)}</pre> -->
<Command.Root class="h-screen rounded-lg border shadow-md" loop bind:value={highlightedStr}>
	<CustomCommandInput
		autofocus
		placeholder="Type a command or search..."
		leftSlot={leftSlot as Snippet}
		bind:value={searchTerm}
	/>
	<Resizable.PaneGroup direction="horizontal" class="w-full rounded-lg">
		<Resizable.Pane defaultSize={30} class="">
			<Command.List class="h-full max-h-full grow">
				<Command.Empty>No results found.</Command.Empty>
				{#each clipboardHistory as item}
					<Command.Item value={JSON.stringify(item)}>
						{@render typeIcon(item.dataType)}
						<span class="truncate">{item.searchText}</span>
					</Command.Item>
				{/each}
			</Command.List>
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane defaultSize={50}>
			<!-- <div class="flex h-[200px] items-center justify-center p-6"> -->
			{#if highlighted}
				<ContentPreview {highlighted} />
			{:else}
				<div class="text-center">No content preview available</div>
			{/if}
			<!-- </div> -->
		</Resizable.Pane>
	</Resizable.PaneGroup>
	<GlobalCommandPaletteFooter />
</Command.Root>
