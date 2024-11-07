<!-- This file renders the main command palette, a list of commands -->
<script lang="ts">
	import { commandLaunchers } from "@/cmds"
	import { builtinCmds } from "@/cmds/builtin"
	import { systemCommands } from "@/cmds/system"
	import { appConfig, appState, devStoreExts, installedStoreExts, quickLinks } from "@/stores"
	import { cmdQueries } from "@/stores/cmdQuery"
	import { commandScore } from "@/utils/command-score"
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
	import type { BuiltinCmd, CmdValue, CommandLaunchers } from "@kksh/ui/types"
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
<!-- <pre>{JSON.stringify($cmdQueries, null, 2)}</pre> -->
<Command.Root
	class={cn("h-screen rounded-lg border shadow-md")}
	bind:value={$appState.highlightedCmd}
	filter={(value, search, keywords) => {
		return commandScore(
			value.startsWith("{") ? (JSON.parse(value) as CmdValue).cmdName : value,
			search,
			keywords
		)
	}}
	loop
>
	<CustomCommandInput
		autofocus
		id="main-command-input"
		placeholder={$cmdQueries.length === 0 ? "Type a command or search..." : undefined}
		bind:value={$appState.searchTerm}
	>
		{#snippet rightSlot()}
			<span
				class={cn("absolute flex space-x-2")}
				style={`left: ${$appState.searchTerm.length + 3}ch`}
			>
				{#each $cmdQueries as cmdQuery}
					{@const queryWidth = Math.max(cmdQuery.name.length, cmdQuery.value.length) + 2}
					<input
						class="bg-muted rounded-md border border-gray-300 pl-2 font-mono focus:outline-none dark:border-gray-600"
						type="text"
						placeholder={cmdQuery.name}
						style={`width: ${queryWidth}ch`}
						onkeydown={(evt) => {
							if (evt.key === "Enter") {
								evt.preventDefault()
								evt.stopPropagation()
								commandLaunchers.onQuickLinkSelect(
									JSON.parse($appState.highlightedCmd),
									$cmdQueries
								)
							}
						}}
						bind:value={cmdQuery.value}
					/>
				{/each}
			</span>

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
		<Command.Empty data-tauri-drag-region>No results found.</Command.Empty>
		<QuickLinks quickLinks={$quickLinks} />
		<Command.Separator />
		{#if $appConfig.extensionsInstallDir && $devStoreExts.length > 0}
			<ExtCmdsGroup
				extensions={$devStoreExts}
				heading="Dev Extensions"
				isDev={true}
				onExtCmdSelect={commandLaunchers.onExtCmdSelect}
				hmr={$appConfig.hmr}
			/>
			<Command.Separator />
		{/if}
		{#if $appConfig.extensionsInstallDir && $installedStoreExts.length > 0}
			<ExtCmdsGroup
				extensions={$installedStoreExts}
				heading="Extensions"
				isDev={false}
				hmr={false}
				onExtCmdSelect={commandLaunchers.onExtCmdSelect}
			/>
			<Command.Separator />
		{/if}
		<BuiltinCmds {builtinCmds} />
		<Command.Separator />
		<SystemCmds {systemCommands} />
	</Command.List>
	<GlobalCommandPaletteFooter />
</Command.Root>
