<!-- This file renders the main command palette, a list of commands -->
<script lang="ts">
	import { commandLaunchers } from "@/cmds"
	import { builtinCmds } from "@/cmds/builtin"
	import { systemCommands } from "@/cmds/system"
	import { appConfig, appState, devStoreExts, installedStoreExts, quickLinks } from "@/stores"
	import { getActiveElementNodeName } from "@/utils/dom"
	import { openDevTools } from "@kksh/api/commands"
	import type { ExtPackageJsonExtra } from "@kksh/api/models"
	import { isExtPathInDev } from "@kksh/extension/utils"
	import { Button, Command, DropdownMenu } from "@kksh/svelte5"
	import type { AppConfig, AppState } from "@kksh/types"
	import {
		BuiltinCmds,
		CustomCommandInput,
		ExtCmdsGroup,
		GlobalCommandPaletteFooter,
		QuickLinks,
		SystemCmds
	} from "@kksh/ui/main"
	import type { BuiltinCmd, CommandLaunchers } from "@kksh/ui/types"
	import { cn } from "@kksh/ui/utils"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { exit } from "@tauri-apps/plugin-process"
	import { EllipsisVerticalIcon } from "lucide-svelte"
	import type { Writable } from "svelte/store"

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
	class={cn("h-screen rounded-lg border shadow-md")}
	bind:value={$appState.highlightedCmd}
	loop
>
	<CustomCommandInput
		autofocus
		id="main-command-input"
		placeholder="Type a command or search..."
		bind:value={$appState.searchTerm}
	>
		{#snippet rightSlot()}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" size="icon"><EllipsisVerticalIcon /></Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.GroupHeading>Settings</DropdownMenu.GroupHeading>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => exit()}>Quit</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => openDevTools()}>Open Dev Tools</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => getCurrentWebviewWindow().hide()}
							>Close Window</DropdownMenu.Item
						>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/snippet}
	</CustomCommandInput>
	<Command.List class="max-h-screen grow">
		<QuickLinks quickLinks={$quickLinks} />
		<Command.Empty data-tauri-drag-region>No results found.</Command.Empty>
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
		<BuiltinCmds {builtinCmds} />
		<SystemCmds {systemCommands} />
		<Command.Separator />
	</Command.List>
	<GlobalCommandPaletteFooter />
</Command.Root>
