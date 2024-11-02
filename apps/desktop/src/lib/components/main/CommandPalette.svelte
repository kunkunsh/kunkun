<!-- This file renders the main command palette, a list of commands -->
<script lang="ts">
	import { type CommandLaunchers } from "@/cmds"
	import { getAppConfigContext } from "@/context"
	import type { AppState, BuiltinCmd } from "@/types"
	import { cn } from "@/utils"
	import type { ExtPackageJsonExtra } from "@kksh/api/models"
	import { isExtPathInDev } from "@kksh/extensions"
	import * as Command from "$lib/components/ui/command"
	import type { Writable } from "svelte/store"
	import BuiltinCmds from "./BuiltinCmds.svelte"
	import CustomCommandInput from "./CustomCommandInput.svelte"
	import ExtCmdsGroup from "./ExtCmdsGroup.svelte"
	import GlobalCommandPaletteFooter from "./GlobalCommandPaletteFooter.svelte"

	const {
		extensions,
		class: className,
		commandLaunchers,
		appState,
		builtinCmds
	}: {
		extensions: ExtPackageJsonExtra[]
		class?: string
		commandLaunchers: CommandLaunchers
		appState: Writable<AppState>
		builtinCmds: BuiltinCmd[]
	} = $props()
	const appConfig = getAppConfigContext()

	let highlightedCmd = $state("")
	let searchTerm = $state("")
</script>

<pre>{$appState.searchTerm}</pre>
<Command.Root
	class={cn("rounded-lg border shadow-md", className)}
	bind:value={$appState.highlightedCmd}
	loop
>
	<CustomCommandInput
		autofocus
		placeholder="Type a command or search..."
		bind:value={$appState.searchTerm}
	/>
	<Command.List class="max-h-screen grow">
		<Command.Empty data-tauri-drag-region>No results found.</Command.Empty>
		<BuiltinCmds {builtinCmds} />
		{#if $appConfig.extensionPath}
			<ExtCmdsGroup
				extensions={extensions.filter((ext) =>
					isExtPathInDev($appConfig.extensionPath!, ext.extPath)
				)}
				heading="Dev Extensions"
				isDev={true}
				onExtCmdSelect={commandLaunchers.onExtCmdSelect}
				hmr={$appConfig.hmr}
			/>
		{/if}
		{#if $appConfig.extensionPath}
			<ExtCmdsGroup
				extensions={extensions.filter(
					(ext) => !isExtPathInDev($appConfig.extensionPath!, ext.extPath)
				)}
				heading="Extensions"
				isDev={false}
				hmr={false}
				onExtCmdSelect={commandLaunchers.onExtCmdSelect}
			/>
		{/if}
		<Command.Separator />
	</Command.List>
	<GlobalCommandPaletteFooter />
</Command.Root>
