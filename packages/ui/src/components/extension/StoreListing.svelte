<script lang="ts">
	import { SBExt } from "@kksh/api/supabase"
	import { Button, Command } from "@kksh/svelte5"
	import { CustomCommandInput, GlobalCommandPaletteFooter } from "@kksh/ui/main"
	import { type Snippet } from "svelte"
	import ArrowLeft from "svelte-radix/ArrowLeft.svelte"
	import type { Writable } from "svelte/store"
	import { CLASSNAMES } from "../../constants"
	import ExtListItem from "./ExtListItem.svelte"

	let {
		storeExtList,
		installedExtsMap,
		onExtItemSelected,
		onExtItemUpgrade,
		onExtItemInstall,
		upgradableExpsMap,
		isUpgradable,
		appState,
		onGoBack,
		searchTerm = $bindable("")
	}: {
		storeExtList: SBExt[]
		installedExtsMap: Record<string, string>
		onExtItemSelected: (ext: SBExt) => void
		onExtItemUpgrade: (ext: SBExt) => void
		onExtItemInstall: (ext: SBExt) => void
		upgradableExpsMap: Record<string, boolean>
		isUpgradable: (dbExt: SBExt, installedExtVersion: string) => boolean
		onGoBack?: () => void
		appState: Writable<{ searchTerm: string }>
		searchTerm: string
	} = $props()
</script>

{#snippet leftSlot()}
	<Button
		variant="outline"
		size="icon"
		onclick={onGoBack}
		class={CLASSNAMES.BACK_BUTTON}
		data-flip-id={CLASSNAMES.BACK_BUTTON}
	>
		<ArrowLeft class="size-4" />
	</Button>
{/snippet}
<Command.Root class="h-screen rounded-lg border shadow-md">
	<CustomCommandInput
		autofocus
		placeholder="Type a command or search..."
		leftSlot={leftSlot as Snippet}
		bind:value={searchTerm}
	/>
	<Command.List class="max-h-screen grow">
		<Command.Empty>No results found.</Command.Empty>
		{#each storeExtList as ext}
			<ExtListItem
				{ext}
				installedVersion={installedExtsMap[ext.identifier]}
				isUpgradable={!!upgradableExpsMap[ext.identifier]}
				onSelect={() => onExtItemSelected(ext)}
				onUpgrade={() => onExtItemUpgrade(ext)}
				onInstall={() => onExtItemInstall(ext)}
			/>
		{/each}
	</Command.List>
	<GlobalCommandPaletteFooter />
</Command.Root>
