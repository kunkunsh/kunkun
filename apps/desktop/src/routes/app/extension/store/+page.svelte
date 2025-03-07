<script lang="ts">
	import { getExtensionsFolder } from "@/constants"
	import { appState, extensions } from "@/stores"
	import { keys } from "@/stores/keys"
	import { supabaseAPI } from "@/supabase"
	import { goBackOnEscapeClearSearchTerm, goHomeOnEscapeClearSearchTerm } from "@/utils/key"
	import { goBack, goHome } from "@/utils/route"
	import { Action as ActionSchema } from "@kksh/api/models"
	import { Action } from "@kksh/api/ui"
	import { SBExt } from "@kksh/supabase/models"
	import type { ExtPublishMetadata } from "@kksh/supabase/models"
	import { type Tables } from "@kksh/supabase/types"
	import { Button, Command } from "@kksh/svelte5"
	import { Constants } from "@kksh/ui"
	import { ExtListItem } from "@kksh/ui/extension"
	import { CustomCommandInput, GlobalCommandPaletteFooter } from "@kksh/ui/main"
	import { platform } from "@tauri-apps/plugin-os"
	import { goto } from "$app/navigation"
	import { ArrowLeft } from "lucide-svelte"
	import type { Snippet } from "svelte"
	import { toast } from "svelte-sonner"
	import { getInstallExtras } from "./[identifier]/helper.js"

	let { data } = $props()
	const { storeExtList, installedExtsMap, upgradableExpsMap } = data
	const _platform = platform()
	let actionPanelOpen = $state(false)
	let listviewInputRef = $state<HTMLInputElement | null>(null)
	let highlightedCmdValue = $state("")

	// function isUpgradeable(item: DbExtItem): boolean {
	// 	if (!item.version) return true // latest extensions always have version, this check should be removed later
	// 	const installed = installedExtMap.value[item.identifier]
	// 	if (!installed) return false
	// 	return (
	// 		gt(item.version, installed.version) &&
	// 		(item.api_version ? isCompatible(item.api_version) : true)
	// 	)
	// }

	function onExtItemSelected(ext: SBExt) {
		goto(`./store/${ext.identifier}`)
	}

	async function onExtItemUpgrade(ext: SBExt) {
		const res = await supabaseAPI.getLatestExtPublish(ext.identifier)
		if (res.error)
			return toast.error("Fail to get latest extension", {
				description: res.error.message
			})
		const tarballUrl = res.data.tarball_path.startsWith("http")
			? res.data.tarball_path
			: supabaseAPI.translateExtensionFilePathToUrl(res.data.tarball_path)
		const installExtras = await getInstallExtras(
			res.data as Tables<"ext_publish"> & { metadata: ExtPublishMetadata }
		)
		return extensions
			.upgradeStoreExtension(ext.identifier, tarballUrl, installExtras)
			.then((newExt) => {
				toast.success(`${ext.name} Upgraded to ${newExt.version}`)
			})
	}

	async function onExtItemInstall(ext: SBExt) {
		const res = await supabaseAPI.getLatestExtPublish(ext.identifier)
		if (res.error)
			return toast.error("Fail to get latest extension", {
				description: res.error.message
			})

		const tarballUrl = res.data.tarball_path.startsWith("http")
			? res.data.tarball_path
			: supabaseAPI.translateExtensionFilePathToUrl(res.data.tarball_path)
		const installExtras = await getInstallExtras(
			res.data as Tables<"ext_publish"> & { metadata: ExtPublishMetadata }
		)
		const installDir = await getExtensionsFolder()
		return extensions
			.installFromTarballUrl(tarballUrl, installDir, installExtras)
			.then(() => toast.success(`Plugin ${ext.name} Installed`))
			.then(() =>
				supabaseAPI.incrementDownloads({
					identifier: ext.identifier,
					version: ext.version
				})
			)
	}

	function onActionPanelBlur() {
		setTimeout(() => {
			listviewInputRef?.focus()
		}, 300)
	}

	$effect(() => {
		void $keys
		const keySet = keys.getSet()
		if (keySet.size === 2) {
			if (keySet.has(_platform === "macos" ? "Meta" : "Control") && keySet.has("k")) {
				setTimeout(() => {
					actionPanelOpen = !actionPanelOpen
					if (!actionPanelOpen) {
						onActionPanelBlur()
						listviewInputRef?.focus()
					}
				}, 100)
			}
		}
	})

	function onkeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			if (document.activeElement === listviewInputRef) {
				goHome()
			}
		}
	}

	let highlightedCmd = $derived.by(() => {
		void highlightedCmdValue
		const ext = storeExtList.find((ext) => ext.identifier === highlightedCmdValue)
		if (ext) {
			return ext
		}
		return null
	})
</script>

<svelte:window on:keydown={onkeydown} />
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
<Command.Root class="h-screen rounded-lg border shadow-md" loop bind:value={highlightedCmdValue}>
	<CustomCommandInput
		bind:ref={listviewInputRef}
		autofocus
		placeholder="Type a command or search..."
		leftSlot={leftSlot as Snippet}
		bind:value={$appState.searchTerm}
		onkeydown={(e) => {
			if (e.key === "Enter") {
				const modifier = _platform === "macos" ? e.metaKey : e.ctrlKey
				if (modifier) {
					if (highlightedCmd) {
						onExtItemInstall(highlightedCmd)
					}
				} else {
					if (highlightedCmd) {
						onExtItemSelected(highlightedCmd)
					}
				}
			}
		}}
	/>
	<Command.List class="max-h-screen grow">
		<Command.Empty>No results found.</Command.Empty>
		{#each storeExtList as ext}
			<ExtListItem
				{ext}
				installedVersion={$installedExtsMap[ext.identifier]}
				isUpgradable={!!$upgradableExpsMap[ext.identifier]}
				onSelect={() => {
					onExtItemSelected(ext)
				}}
				onUpgrade={() => onExtItemUpgrade(ext)}
				onInstall={() => onExtItemInstall(ext)}
			/>
		{/each}
	</Command.List>
	<GlobalCommandPaletteFooter
		defaultAction="Show Details"
		bind:actionPanelOpen
		{onActionPanelBlur}
		actionPanel={new Action.ActionPanel({
			title: "Actions",
			items: [
				new Action.Action({
					title: `Install (${_platform === "macos" ? "⌘" : "Ctrl"} + ⏎)`,
					value: "install"
				})
			]
		})}
		onActionSelected={(value) => {
			if (value === "install") {
				console.log("install")
				if (highlightedCmd) {
					onExtItemInstall(highlightedCmd)
				}
			}
		}}
		onDefaultActionSelected={() => {
			console.log("default install")
			if (highlightedCmd) {
				onExtItemInstall(highlightedCmd)
			}
		}}
	/>
</Command.Root>
