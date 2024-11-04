<!-- This file renders the main command palette, a list of commands -->
<!-- This is not placed in @kksh/ui because it depends on the app config and is very complex, 
passing everything through props will be very complicated and hard to maintain.
-->
<script lang="ts">
	import { systemCommands } from "@/cmds/system"
	import { devStoreExts, installedStoreExts } from "@/stores"
	import { getActiveElementNodeName } from "@/utils/dom"
	import type { ExtPackageJsonExtra } from "@kksh/api/models"
	import { isExtPathInDev } from "@kksh/extension/utils"
	import { Command } from "@kksh/svelte5"
	import type { AppConfig, AppState } from "@kksh/types"
	import {
		BuiltinCmds,
		CustomCommandInput,
		ExtCmdsGroup,
		GlobalCommandPaletteFooter,
		SystemCmds
	} from "@kksh/ui/main"
	import type { BuiltinCmd, CommandLaunchers } from "@kksh/ui/types"
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

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			if (getActiveElementNodeName() === "INPUT") {
				;(event.target as HTMLInputElement).value = ""
				if ((event.target as HTMLInputElement | undefined)?.id === "main-command-input") {
					$appState.searchTerm = ""
				}
			}
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />
<Command.Root
	class={cn("rounded-lg border shadow-md", className)}
	bind:value={$appState.highlightedCmd}
	loop
>
	<CustomCommandInput
		autofocus
		id="main-command-input"
		placeholder="Type a command or search..."
		bind:value={$appState.searchTerm}
	/>
	<Command.List class="max-h-screen grow">
		<Command.Empty data-tauri-drag-region>No results found.</Command.Empty>
		<BuiltinCmds {builtinCmds} />
		<SystemCmds {systemCommands} />
		{#if $appConfig.extensionsInstallDir && $devStoreExts.length > 0}
			<ExtCmdsGroup
				extensions={$devStoreExts}
				heading="Dev Extensions"
				isDev={true}
				onExtCmdSelect={commandLaunchers.onExtCmdSelect}
				hmr={$appConfig.hmr}
			/>
		{/if}
		{#if $appConfig.extensionsInstallDir && $installedStoreExts.length > 0}
			<ExtCmdsGroup
				extensions={$installedStoreExts}
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
