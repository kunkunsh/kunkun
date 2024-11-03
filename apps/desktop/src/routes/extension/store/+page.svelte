<script lang="ts">
	import { getExtensionsFolder } from "@/constants"
	import { appState, extensions } from "@/stores"
	import { supabaseAPI } from "@/supabase"
	import { goBackOnEscape, goBackOnEscapeClearSearchTerm } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { isCompatible } from "@kksh/api"
	import { SBExt } from "@kksh/api/supabase"
	import { isUpgradable } from "@kksh/extension"
	import { Command } from "@kksh/svelte5"
	import { StoreListing } from "@kksh/ui/extension"
	import { greaterThan, parse as parseSemver } from "@std/semver"
	import { goto } from "$app/navigation"
	import { onMount } from "svelte"
	import { toast } from "svelte-sonner"
	import { get } from "svelte/store"
	import { type PageData } from "./$types"

	let { data }: { data: PageData } = $props()
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
			return toast.error("Fail to get latest extension", { description: res.error.message })
		const tarballUrl = supabaseAPI.translateExtensionFilePathToUrl(res.data.tarball_path)
		return extensions.upgradeStoreExtension(ext.identifier, tarballUrl).then((newExt) => {
			toast.success(`${ext.name} Upgraded to ${newExt.version}`)
		})
	}

	async function onExtItemInstall(ext: SBExt) {
		console.log("onExtItemInstall", ext)
		const res = await supabaseAPI.getLatestExtPublish(ext.identifier)
		if (res.error)
			return toast.error("Fail to get latest extension", { description: res.error.message })

		const tarballUrl = supabaseAPI.translateExtensionFilePathToUrl(res.data.tarball_path)
		const installDir = await getExtensionsFolder()
		return extensions
			.installFromTarballUrl(tarballUrl, installDir)
			.then(() => toast.success(`Plugin ${ext.name} Installed`))
			.then(() =>
				supabaseAPI.incrementDownloads({
					identifier: ext.identifier,
					version: ext.version
				})
			)
	}
</script>

<svelte:window on:keydown={goBackOnEscapeClearSearchTerm} />
<StoreListing
	{storeExtList}
	{appState}
	installedExtsMap={$installedExtsMap}
	upgradableExpsMap={$upgradableExpsMap}
	{onExtItemSelected}
	{onExtItemUpgrade}
	{onExtItemInstall}
	{isUpgradable}
	onGoBack={goBack}
/>
