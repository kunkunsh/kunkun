<!-- This file renders the main command palette, a list of commands -->
<script lang="ts">
	import type { ExtPackageJsonExtra } from "@kksh/api/models"
	import { isExtPathInDev } from "@kksh/extensions"
	import { Command } from "@kksh/svelte5"
	import type { AppConfig, AppState, BuiltinCmd, CommandLaunchers } from "@kksh/types"
	import {
		BuiltinCmds,
		CustomCommandInput,
		ExtCmdsGroup,
		GlobalCommandPaletteFooter
	} from "@kksh/ui/main"
	import { cn } from "@kksh/ui/utils"
	import type { Writable } from "svelte/store"

	const {
		extensions,
		appConfig,
		class: className,
		commandLaunchers,
		appState,
		builtinCmds
	}: {
		extensions: ExtPackageJsonExtra[]
		appConfig: Writable<AppConfig>
		class?: string
		commandLaunchers: CommandLaunchers
		appState: Writable<AppState>
		builtinCmds: BuiltinCmd[]
	} = $props()
	// const appConfig = getAppConfigContext()

	let highlightedCmd = $state("")
	let searchTerm = $state("")
</script>

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
