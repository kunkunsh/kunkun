<script lang="ts">
	import { getExtensionsFolder } from "@/constants.js"
	import { extensions, installedStoreExts } from "@/stores/extensions.js"
	import { supabaseAPI } from "@/supabase"
	import { goBack } from "@/utils/route.js"
	import type { Tables } from "@kksh/api/supabase/types"
	import { ExtPublishMetadata } from "@kksh/supabase/models"
	import { Button } from "@kksh/svelte5"
	import { cn } from "@kksh/svelte5/utils"
	import { Constants } from "@kksh/ui"
	import { StoreExtDetail } from "@kksh/ui/extension"
	import { greaterThan, parse as parseSemver } from "@std/semver"
	import { error } from "@tauri-apps/plugin-log"
	import { goto } from "$app/navigation"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { onMount } from "svelte"
	import { toast } from "svelte-sonner"
	import { derived as storeDerived } from "svelte/store"
	import { getInstallExtras } from "./helper.js"

	const { data } = $props()
	const ext: Tables<"ext_publish"> & { metadata: ExtPublishMetadata } = $derived(data.ext)
	const manifest = $derived(data.manifest)
	const installedExt = storeDerived(installedStoreExts, ($e) => {
		return $e.find((e) => e.kunkun.identifier === ext.identifier)
	})

	const isUpgradable = $derived(
		$installedExt
			? greaterThan(parseSemver(ext.version), parseSemver($installedExt.version))
			: false
	)
	$effect(() => {
		console.log("isUpgradable", isUpgradable)
		if (isUpgradable) {
			showBtn.upgrade = true
			showBtn.install = false
			showBtn.uninstall = true
		}
	})

	onMount(() => {
		showBtn = {
			install: !$installedExt,
			upgrade: isUpgradable,
			uninstall: !!$installedExt
		}
	})

	let loading = $state({
		install: false,
		uninstall: false,
		upgrade: false
	})
	let showBtn = $state({
		install: false,
		upgrade: false,
		uninstall: false
	})
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
		loading.install = true
		const tarballUrl = ext.tarball_path.startsWith("http")
			? ext.tarball_path
			: supabaseAPI.translateExtensionFilePathToUrl(ext.tarball_path)
		const installExtras = await getInstallExtras(ext)
		const installDir = await getExtensionsFolder()
		return extensions
			.installFromTarballUrl(tarballUrl, installDir, installExtras)
			.then(() => toast.success(`Plugin ${ext.name} Installed`))
			.then((loadedExt) => {
				supabaseAPI.incrementDownloads({
					identifier: ext.identifier,
					version: ext.version
				})
				showBtn.install = false
				showBtn.uninstall = true
			})
			.catch((err) => {
				console.error("err", err)
				toast.error("Fail to install tarball", { description: err })
			})
			.finally(() => {
				loading.install = false
			})
	}

	function onUpgradeSelected() {
		loading.upgrade = true
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
				setTimeout(() => {
					loading.upgrade = false
					showBtn.upgrade = false
					showBtn.uninstall = true
				}, 2000)
			})
	}

	function onUninstallSelected() {
		loading.uninstall = true
		return extensions
			.uninstallStoreExtensionByIdentifier(ext.identifier)
			.then((uninstalledExt) => {
				toast.success(`${uninstalledExt.name} Uninstalled`)
				loading.uninstall = false
				showBtn.uninstall = false
				showBtn.install = true
			})
			.catch((err) => {
				toast.error("Fail to uninstall extension", { description: err })
				error(`Fail to uninstall store extension (${ext.identifier}): ${err}`)
			})
			.finally(() => {})
	}

	function onEnterPressed() {
		if (showBtn.install) {
			return onInstallSelected()
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			if (!delayedImageDialogOpen) {
				goto("/app/extension/store")
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />
<Button
	variant="outline"
	size="icon"
	class={cn("fixed left-3 top-3 z-50", Constants.CLASSNAMES.BACK_BUTTON)}
	data-flip-id={Constants.CLASSNAMES.BACK_BUTTON}
	onclick={() => goto("/app/extension/store")}
>
	<ArrowLeftIcon />
</Button>
<StoreExtDetail
	class="px-5"
	{ext}
	{manifest}
	installedExt={$installedExt}
	{demoImages}
	{showBtn}
	{loading}
	{onInstallSelected}
	{onUpgradeSelected}
	{onUninstallSelected}
	{onEnterPressed}
	bind:imageDialogOpen
/>
