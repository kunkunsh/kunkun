<!-- This file renders the main command palette, a list of commands -->
<script lang="ts">
	import { commandLaunchers } from "@/cmds"
	import { builtinCmds } from "@/cmds/builtin"
	import { systemCommands } from "@/cmds/system"
	import AppsCmds from "@/components/main/AppsCmds.svelte"
	import { i18n } from "@/i18n"
	import * as m from "@/paraglide/messages"
	import {
		appConfig,
		appConfigLoaded,
		// appsFiltered,
		appsLoader,
		appState,
		devStoreExts,
		// devStoreExtsFiltered,
		// installedStoreExtsFiltered,
		installedStoreExts,
		quickLinks
		// quickLinksFiltered
	} from "@/stores"
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
	import { cn } from "@kksh/ui/utils"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { getCurrentWindow, Window } from "@tauri-apps/api/window"
	import { platform } from "@tauri-apps/plugin-os"
	import { exit } from "@tauri-apps/plugin-process"
	import { goto } from "$app/navigation"
	import { ArrowBigUpIcon, CircleXIcon, EllipsisVerticalIcon, RefreshCcwIcon } from "lucide-svelte"
	import { onMount } from "svelte"
	import { killPid } from "tauri-plugin-shellx-api"

	const win = getCurrentWindow()
	let inputEle: HTMLInputElement | null = $state(null)
	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			if ((event.target as HTMLInputElement).value === "") {
				win.hide()
			} else {
				;(event.target as HTMLInputElement).value = ""
				$appState.searchTerm = ""
			}
		}
	}

	onMount(() => {
		Window.getByLabel("splashscreen").then((splashscreenWin) => {
			if (splashscreenWin) {
				splashscreenWin.close()
			}
			win.show()
		})
		win.onFocusChanged(({ payload: focused }) => {
			if (focused) {
				win.show()
				inputEle?.focus()
			}
		})
		inputEle?.focus()
		appConfigLoaded.subscribe((loaded) => {
			// wait for appConfig store to be loaded, it's async and saved to disk when changed, so we use another store appConfigLoaded
			// to keep track of the loading status
			if (loaded) {
				if (!appConfig.get().onBoarded) {
					setTimeout(() => {
						goto(i18n.resolveRoute("/app/help/onboarding"))
					}, 300)
				}
			}
		})
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
	class={cn("h-screen rounded-lg shadow-md")}
	bind:value={$appState.highlightedCmd}
	shouldFilter={true}
	loop
>
	<CustomCommandInput
		autofocus
		bind:ref={inputEle}
		id="main-command-input"
		placeholder={$cmdQueries.length === 0 ? m.home_command_input_placeholder() : undefined}
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
				<DropdownMenu.Content class="w-fit min-w-80">
					<DropdownMenu.Group>
						<DropdownMenu.Item onclick={() => exit()}>
							<CircleXIcon class="h-4 w-4 text-red-500" />
							{m.home_command_input_dropdown_quit()}
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => getCurrentWebviewWindow().hide()}>
							<CircleXIcon class="h-4 w-4 text-red-500" />
							{m.home_command_input_dropdown_close_window()}
						</DropdownMenu.Item>
					</DropdownMenu.Group>
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						<DropdownMenu.GroupHeading data-tauri-drag-region>
							{m.home_command_input_dropdown_developer_title()}
						</DropdownMenu.GroupHeading>
						<DropdownMenu.Item onclick={toggleDevTools}>
							<Icon icon="mingcute:code-fill" class="mr-2 h-5 w-5 text-green-500" />
							{m.home_command_input_dropdown_toggle_devtools()}
							<DropdownMenu.Shortcut>
								<span class="flex items-center">⌃+<ArrowBigUpIcon class="h-4 w-4" />+I </span>
							</DropdownMenu.Shortcut>
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => location.reload()}>
							<RefreshCcwIcon class="mr-2 h-4 w-4 text-green-500" />
							{m.home_command_input_dropdown_reload_window()}
							<DropdownMenu.Shortcut>
								<span class="flex items-center">⌃+<ArrowBigUpIcon class="h-4 w-4" />+R </span>
							</DropdownMenu.Shortcut>
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => location.reload()}>
							<RefreshCcwIcon class="mr-2 h-4 w-4 text-green-500" />
							{m.home_command_input_dropdown_open_preference()}
							<DropdownMenu.Shortcut>
								{#if platform() === "macos"}
									<span class="flex items-center">⌘+Comma</span>
								{:else}
									<span class="flex items-center">Ctrl+Comma</span>
								{/if}
							</DropdownMenu.Shortcut>
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
							{m.home_command_input_dropdown_toggle_dev_extension_hmr()}
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
				heading={m.command_group_heading_dev_ext()}
				isDev={true}
				onExtCmdSelect={commandLaunchers.onExtCmdSelect}
				hmr={$appConfig.hmr}
			/>
		{/if}

		{#if $appConfig.extensionsInstallDir && $installedStoreExts.length > 0}
			<ExtCmdsGroup
				extensions={$installedStoreExts}
				heading={m.command_group_heading_ext()}
				isDev={false}
				hmr={false}
				onExtCmdSelect={commandLaunchers.onExtCmdSelect}
			/>
		{/if}
		<QuickLinks quickLinks={$quickLinks} />
		<BuiltinCmds builtinCmds={$builtinCmds} />
		<SystemCmds systemCommands={$systemCommands} />
		<AppsCmds apps={$appsLoader} />

		<!-- <AppsCmds apps={$appsFiltered} /> -->
		<!-- {#if $quickLinksFiltered.length > 0}
			<QuickLinks quickLinks={$quickLinksFiltered} />
		{/if}
		{#if $appsFiltered.length > 0}
			<AppsCmds apps={$appsFiltered} />
		{/if}
		{#if $builtinCmds.length > 0}
			<BuiltinCmds builtinCmds={$builtinCmds} />
		{/if}
		{#if $systemCommandsFiltered.length > 0}
			<SystemCmds systemCommands={$systemCommandsFiltered} />
		{/if} -->
		<!-- <AppsCmds apps={$appsLoader} /> -->
		<!-- <AppsCmds apps={$appsFiltered} /> -->
	</Command.List>
	<GlobalCommandPaletteFooter />
</Command.Root>
