<!-- This file renders the main command palette, a list of commands -->
<script lang="ts">
	import { commandLaunchers } from "@/cmds"
	import { builtinCmds } from "@/cmds/builtin"
	import { systemCommands } from "@/cmds/system"
	import { appConfig, appState, devStoreExts, installedStoreExts, quickLinks } from "@/stores"
	import { cmdQueries } from "@/stores/cmdQuery"
	import { isKeyboardEventFromInputElement } from "@/utils/dom"
	import Icon from "@iconify/svelte"
	import { toggleDevTools } from "@kksh/api/commands"
	import { Button, Command, DropdownMenu } from "@kksh/svelte5"
	import {
		BuiltinCmds,
		CustomCommandInput,
		ExtCmdsGroup,
		GlobalCommandPaletteFooter,
		QuickLinks,
		SystemCmds
	} from "@kksh/ui/main"
	import type { CmdValue } from "@kksh/ui/types"
	import { cn, commandScore } from "@kksh/ui/utils"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { getCurrentWindow, Window } from "@tauri-apps/api/window"
	import { exit } from "@tauri-apps/plugin-process"
	import { ArrowBigUpIcon, CircleXIcon, EllipsisVerticalIcon, RefreshCcwIcon } from "lucide-svelte"
	import { onMount } from "svelte"
	import { hasCommand, whereIsCommand } from "tauri-plugin-shellx-api"

	let inputEle: HTMLInputElement | null = $state(null)
	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			;(event.target as HTMLInputElement).value = ""
			$appState.searchTerm = ""
		}
	}

	onMount(() => {
		Promise.all([Window.getByLabel("splashscreen"), getCurrentWindow()]).then(
			([splashscreenWin, mainWin]) => {
				mainWin.show()
				if (splashscreenWin) {
					splashscreenWin.close()
				}
			}
		)
	})
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "/") {
			if (isKeyboardEventFromInputElement(e)) {
				e.preventDefault()
			} else {
				e.preventDefault()
				inputEle?.focus()
			}
		}
	}}
/>
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
		bind:ref={inputEle}
		id="main-command-input"
		placeholder={$cmdQueries.length === 0 ? "Type a command or search..." : undefined}
		bind:value={$appState.searchTerm}
		onkeydown={onKeyDown}
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
				<DropdownMenu.Content class="w-80">
					<DropdownMenu.Group>
						<DropdownMenu.Item onclick={() => exit()}>
							<CircleXIcon class="h-4 w-4 text-red-500" />
							Quit
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => getCurrentWebviewWindow().hide()}>
							<CircleXIcon class="h-4 w-4 text-red-500" />
							Close Window
						</DropdownMenu.Item>
					</DropdownMenu.Group>
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						<DropdownMenu.GroupHeading data-tauri-drag-region>Developer</DropdownMenu.GroupHeading>
						<DropdownMenu.Item onclick={toggleDevTools}>
							<Icon icon="mingcute:code-fill" class="mr-2 h-5 w-5 text-green-500" />
							Toggle Devtools
							<DropdownMenu.Shortcut
								><span class="flex items-center">⌃+<ArrowBigUpIcon class="h-4 w-4" />+I</span
								></DropdownMenu.Shortcut
							>
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => location.reload()}>
							<RefreshCcwIcon class="mr-2 h-4 w-4 text-green-500" />
							Reload Window
							<DropdownMenu.Shortcut
								><span class="flex items-center">⌃+<ArrowBigUpIcon class="h-4 w-4" />+R</span
								></DropdownMenu.Shortcut
							>
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => {
								appConfig.update((config) => ({ ...config, hmr: !config.hmr }))
							}}
						>
							<Icon
								icon={$appConfig.hmr ? "fontisto:toggle-on" : "fontisto:toggle-off"}
								class={cn("mr-1 h-5 w-5", { "text-green-500": $appConfig.hmr })}
							/>
							Toggle Dev Extension HMR
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/snippet}
	</CustomCommandInput>
	<Command.List class="max-h-screen grow">
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
		<QuickLinks quickLinks={$quickLinks} />
		<BuiltinCmds builtinCmds={$builtinCmds} />
		<SystemCmds {systemCommands} />
	</Command.List>
	<GlobalCommandPaletteFooter />
</Command.Root>
