<script lang="ts">
	import { getExtensionsFolder } from "@/constants.js"
	import { appConfig } from "@/stores/appConfig.js"
	import { extensions, installedStoreExts } from "@/stores/extensions.js"
	import { supabase, supabaseAPI, supabaseExtensionsStorage } from "@/supabase"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route.js"
	import { isExtPathInDev } from "@kksh/extension"
	import { installTarballUrl } from "@kksh/extension/install"
	import { Button } from "@kksh/svelte5"
	import { StoreExtDetail } from "@kksh/ui/extension"
	import * as path from "@tauri-apps/api/path"
	import { error } from "@tauri-apps/plugin-log"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { toast } from "svelte-sonner"
	import { get, derived as storeDerived } from "svelte/store"
	import * as v from "valibot"

	const { data } = $props()
	let { ext, manifest } = data
	const installedExt = storeDerived(installedStoreExts, ($e) => {
		return $e.find((e) => e.kunkun.identifier === ext.identifier)
	})
	let btnLoading = $state(false)
	let imageDialogOpen = $state(false)
	let delayedImageDialogOpen = $state(false)
	$effect(() => {
		imageDialogOpen // do not remove this line, $effect only subscribe to synchronous variable inside it
		setTimeout(() => {
			delayedImageDialogOpen = imageDialogOpen
		}, 500)
	})

	const demoImages = $derived(
		ext.demo_images.map((src) => supabaseAPI.translateExtensionFilePathToUrl(src))
	)

	async function onInstallSelected() {
		btnLoading = true
		const tarballUrl = supabaseAPI.translateExtensionFilePathToUrl(ext.tarball_path)
		const installDir = await getExtensionsFolder()
		return extensions
			.installFromTarballUrl(tarballUrl, installDir)
			.then(() => toast.success(`Plugin ${ext.name} Installed`))
			.then(async (loadedExt) =>
				supabaseAPI.incrementDownloads({
					identifier: ext.identifier,
					version: ext.version
				})
			)
			.catch((err) => {
				toast.error("Fail to install tarball", { description: err })
			})
			.finally(() => {
				btnLoading = false
			})
	}

	function onUpgradeSelected() {
		btnLoading = true
		const tarballUrl = supabaseAPI.translateExtensionFilePathToUrl(ext.tarball_path)
		return extensions
			.upgradeStoreExtension(ext.identifier, tarballUrl)
			.then((newExt) => {
				toast.success(`${ext.name} Upgraded from ${$installedExt?.version} to ${newExt.version}`)
			})
			.catch((err) => {
				toast.error("Fail to upgrade extension", { description: err })
			})
			.finally(() => {
				btnLoading = false
			})
	}

	function onUninstallSelected() {
		btnLoading = true
		return extensions
			.uninstallStoreExtensionByIdentifier(ext.identifier)
			.then((uninstalledExt) => {
				toast.success(`${uninstalledExt.name} Uninstalled`)
			})
			.catch((err) => {
				toast.error("Fail to uninstall extension", { description: err })
				error(`Fail to uninstall store extension (${ext.identifier}): ${err}`)
			})
			.finally(() => {
				btnLoading = false
			})
	}

	function onEnterPressed() {
		return onInstallSelected()
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			if (!delayedImageDialogOpen) {
				goBack()
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<Button variant="outline" size="icon" class="fixed left-3 top-3" onclick={goBack}>
	<ArrowLeftIcon />
</Button>
<StoreExtDetail
	{ext}
	{manifest}
	installedExt={$installedExt}
	{demoImages}
	bind:btnLoading
	{onInstallSelected}
	{onUpgradeSelected}
	{onUninstallSelected}
	{onEnterPressed}
	bind:imageDialogOpen
/>
