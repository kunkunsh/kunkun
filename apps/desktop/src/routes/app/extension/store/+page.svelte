<script lang="ts">
	import { getExtensionsFolder } from "@/constants"
	import { appState, extensions } from "@/stores"
	import { supabaseAPI } from "@/supabase"
	import { goBackOnEscapeClearSearchTerm, goHomeOnEscapeClearSearchTerm } from "@/utils/key"
	import { goBack, goHome } from "@/utils/route"
	import { SBExt } from "@kksh/supabase/models"
	import type { ExtPublishMetadata } from "@kksh/supabase/models"
	import { type Tables } from "@kksh/supabase/types"
	import { Button, Command } from "@kksh/svelte5"
	import { Constants } from "@kksh/ui"
	import { ExtListItem } from "@kksh/ui/extension"
	import { CustomCommandInput, GlobalCommandPaletteFooter } from "@kksh/ui/main"
	import { goto } from "$app/navigation"
	import { ArrowLeft } from "lucide-svelte"
	import type { Snippet } from "svelte"
	import { toast } from "svelte-sonner"
	import { getInstallExtras } from "./[identifier]/helper.js"

	let { data } = $props()
	const { storeExtList, installedStoreExts, installedExtsMap, upgradableExpsMap } = data

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
</script>

<svelte:window on:keydown={goHomeOnEscapeClearSearchTerm} />
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
<Command.Root class="h-screen rounded-lg border shadow-md" loop>
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
				installedVersion={$installedExtsMap[ext.identifier]}
				isUpgradable={!!$upgradableExpsMap[ext.identifier]}
				onSelect={() => onExtItemSelected(ext)}
				onUpgrade={() => onExtItemUpgrade(ext)}
				onInstall={() => onExtItemInstall(ext)}
			/>
		{/each}
	</Command.List>
	<GlobalCommandPaletteFooter />
</Command.Root>
