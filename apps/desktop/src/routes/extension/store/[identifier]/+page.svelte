<script lang="ts">
	import { supabase, supabaseExtensionsStorage } from "@/supabase"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route.js"
	import { Button } from "@kksh/svelte5"
	import { StoreExtDetail } from "@kksh/ui/extension"
	import { ArrowLeftIcon } from "lucide-svelte"

	const { data } = $props()
	const { ext, installedExt, manifest } = data
	let btnLoading = $state(false)
	let imageDialogOpen = $state(false)
	let delayedImageDialogOpen = $state(false)
	$effect(() => {
		imageDialogOpen
		setTimeout(() => {
			delayedImageDialogOpen = imageDialogOpen
		}, 500)
	})
	const demoImages = $derived(
		ext.demo_images.map((src) => supabaseExtensionsStorage.getPublicUrl(src).data.publicUrl)
	)

	function onInstallSelected() {
		console.log("onInstallSelected")
	}

	function onUpgradeSelected() {
		console.log("onUpgradeSelected")
	}

	function onUninstallSelected() {
		console.log("onUninstallSelected")
	}

	function onEnterPressed() {
		console.log("onEnterPressed")
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
	{demoImages}
	bind:btnLoading
	{onInstallSelected}
	{onUpgradeSelected}
	{onUninstallSelected}
	{onEnterPressed}
	bind:imageDialogOpen
/>
