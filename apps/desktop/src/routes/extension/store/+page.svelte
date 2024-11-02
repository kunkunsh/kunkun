<script lang="ts">
	import StoreListing from "@/components/extension/StoreListing.svelte"
	import Cmd from "@/components/main/cmd.svelte"
	import { appState } from "@/stores"
	import { goBackOnEscape, goBackOnEscapeClearSearchTerm } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { ExtItem } from "@kksh/supabase"
	import { Command } from "@kksh/svelte5"
	import { goto } from "$app/navigation"
	import { onMount } from "svelte"
	import { type PageData } from "./$types"

	let { data }: { data: PageData } = $props()
	const { storeExtList, installedStoreExts, installedExtsMap } = data

	// const installedExtsMap = Object.fromEntries(
	// 	installedExts.map((ext) => [ext.kunkun.identifier, ext.version])
	// )

	function onExtItemSelected(ext: ExtItem) {
		console.log("onExtItemSelected", ext)
		goto(`./store/${ext.identifier}`)
	}

	function onExtItemUpgrade(ext: ExtItem) {
		console.log("onExtItemUpgrade", ext)
	}

	function onExtItemInstall(ext: ExtItem) {
		console.log("onExtItemInstall", ext)
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			if ($appState.searchTerm) {
				$appState.searchTerm = ""
			} else {
				goBack()
			}
		}
	}
</script>

<svelte:window on:keydown={goBackOnEscapeClearSearchTerm} />
<StoreListing
	{storeExtList}
	{appState}
	installedExtsMap={$installedExtsMap}
	{onExtItemSelected}
	{onExtItemUpgrade}
	{onExtItemInstall}
/>
