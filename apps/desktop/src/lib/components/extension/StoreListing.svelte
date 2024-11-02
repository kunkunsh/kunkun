<script lang="ts">
	import { goBack } from "@/utils/route"
	import { ExtItem } from "@kksh/supabase"
	import { Button, Command } from "@kksh/svelte5"
	import { CustomCommandInput, GlobalCommandPaletteFooter } from "@kksh/ui/main"
	import { type Snippet } from "svelte"
	import ArrowLeft from "svelte-radix/ArrowLeft.svelte"
	import type { Writable } from "svelte/store"
	import ExtListItem from "./ExtListItem.svelte"

	let {
		storeExtList,
		installedExtsMap,
		onExtItemSelected,
		onExtItemUpgrade,
		onExtItemInstall,
		appState
	}: {
		storeExtList: ExtItem[]
		installedExtsMap: Record<string, string>
		onExtItemSelected: (ext: ExtItem) => void
		onExtItemUpgrade: (ext: ExtItem) => void
		onExtItemInstall: (ext: ExtItem) => void
		// searchTerm: string
		appState: Writable<{ searchTerm: string }>
	} = $props()
</script>

{#snippet leftSlot()}
	<Button variant="outline" size="icon" onclick={goBack}>
		<ArrowLeft class="size-4" />
	</Button>
{/snippet}
<Command.Root class="h-screen rounded-lg border shadow-md">
	<CustomCommandInput
		autofocus
		placeholder="Type a command or search..."
		leftSlot={leftSlot as Snippet}
		bind:value={$appState.searchTerm}
	/>
	<Command.List class="max-h-screen grow">
		<Command.Empty>No results found.</Command.Empty>
		{#each storeExtList as ext}
			<ExtListItem
				{ext}
				installedVersion={installedExtsMap[ext.identifier]}
				onSelect={() => onExtItemSelected(ext)}
				onUpgrade={() => onExtItemUpgrade(ext)}
				onInstall={() => onExtItemInstall(ext)}
			/>
		{/each}
	</Command.List>
	<GlobalCommandPaletteFooter />
</Command.Root>
