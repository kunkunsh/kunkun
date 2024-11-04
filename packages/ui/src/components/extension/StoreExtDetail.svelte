<script lang="ts">
	import autoAnimate from "@formkit/auto-animate"
	import Icon from "@iconify/svelte"
	import { ExtPackageJsonExtra, IconEnum, KunkunExtManifest } from "@kksh/api/models"
	import { type Tables } from "@kksh/api/supabase/types"
	import { Button, ScrollArea, Separator } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { CircleCheckBigIcon, MoveRightIcon, Trash2Icon } from "lucide-svelte"
	import DialogImageCarousel from "../common/DialogImageCarousel.svelte"
	import PlatformsIcons from "../common/PlatformsIcons.svelte"
	import PermissionInspector from "./PermissionInspector.svelte"

	let {
		ext,
		installedExt,
		manifest,
		demoImages,
		class: className,
		onEnterPressed,
		onInstallSelected,
		onUpgradeSelected,
		onUninstallSelected,
		showBtn,
		loading,
		imageDialogOpen = $bindable(false)
	}: {
		ext: Tables<"ext_publish">
		installedExt?: ExtPackageJsonExtra
		manifest: KunkunExtManifest
		demoImages: string[]
		class?: string
		onInstallSelected?: () => void
		onUpgradeSelected?: () => void
		onUninstallSelected?: () => void
		onEnterPressed?: () => void
		showBtn: {
			upgrade: boolean
			install: boolean
			uninstall: boolean
		}
		loading: {
			install: boolean
			uninstall: boolean
			upgrade: boolean
		}
		imageDialogOpen: boolean
	} = $props()

	const isInstalled = $derived(installedExt !== undefined)
	let demoImageIndex = $state(0)

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			onEnterPressed?.()
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />
{#snippet spinLoader()}
	<IconMultiplexer
		icon={{ type: IconEnum.Iconify, value: "uil:spinner-alt" }}
		class="h-6 w-6 animate-spin"
	/>
{/snippet}

{#snippet upgradeBtn()}
	<Button
		class="w-full bg-yellow-600 hover:bg-yellow-500"
		disabled={loading.upgrade}
		variant="destructive"
		onclick={onUpgradeSelected}
	>
		<span>Upgrade</span>
		{#if loading.upgrade}
			{@render spinLoader()}
		{:else}
			<Icon icon="carbon:upgrade" class="inline h-5 w-5" />
			<small>{installedExt?.version}</small>
			<MoveRightIcon class="w-4" />
			<small>{ext.version}</small>
		{/if}
	</Button>
{/snippet}

{#snippet uninstallBtn()}
	<Button
		class="w-full bg-red-600 hover:bg-red-500"
		disabled={loading.uninstall}
		variant="destructive"
		onclick={onUninstallSelected}
	>
		<span>Uninstall</span>
		{#if loading.uninstall}
			{@render spinLoader()}
		{:else}
			<Trash2Icon class="h-5 w-5" />
		{/if}
	</Button>
{/snippet}

{#snippet installBtn()}
	<Button
		class="w-full bg-green-700 text-white hover:bg-green-600"
		disabled={loading.install}
		onclick={onInstallSelected}
	>
		<span>Install</span>
		{#if loading.install}
			{@render spinLoader()}
		{:else}
			<Icon icon="mi:enter" class="h-5 w-5" />
		{/if}
	</Button>
{/snippet}

<div data-tauri-drag-region class="h-14"></div>
<ScrollArea class="container pb-12">
	<div class="flex items-center gap-4">
		<span style:--ext-logo-img="ext-logo-{ext.identifier}" class="ext-logo-image">
			<IconMultiplexer icon={manifest.icon} class="h-12 w-12" />
		</span>
		<div>
			<span class="flex items-center">
				<strong class="ext-name text-xl">{manifest?.name}</strong>
				{#if isInstalled}
					<CircleCheckBigIcon class="ml-2 inline text-green-400" />
				{/if}
			</span>
			<pre class="text-muted-foreground text-xs">{ext.identifier}</pre>
			<pre class="text-muted-foreground text-xs">Version: {ext.version}</pre>
		</div>
	</div>
	{#if demoImages.length > 0}
		<Separator class="my-3" />
		<DialogImageCarousel
			bind:open={imageDialogOpen}
			imageSrcs={demoImages}
			bind:target={demoImageIndex}
		/>
		<ScrollArea
			orientation="horizontal"
			class="relative w-full whitespace-nowrap rounded-md border"
		>
			<div class="flex min-w-full space-x-4 p-4">
				{#each demoImages as src, index}
					<button
						class="shrink-0"
						onclick={() => {
							demoImageIndex = index
							imageDialogOpen = true
						}}
					>
						<img {src} class="inline h-32 cursor-pointer" alt="" />
					</button>
				{/each}
			</div>
		</ScrollArea>
	{/if}

	<Separator class="my-3" />
	<h2 class="text-lg font-bold">Security and Privacy</h2>
	<PermissionInspector {manifest} />
	<Separator class="my-3" />
	<h2 class="text-lg font-bold">Description</h2>

	<div class="text-sm">{manifest?.shortDescription}</div>
	<div class="text-sm">{manifest?.longDescription}</div>
	<Separator class="my-3" />
	<h2 class="text-lg font-bold">Commands</h2>

	<ul>
		{#if manifest}
			{#each [...manifest.customUiCmds, ...manifest.templateUiCmds] as cmd}
				<li>
					<div class="flex items-center space-x-3">
						{#if manifest}
							<IconMultiplexer icon={manifest.icon} class="inline h-6 w-6" />
						{/if}
						<div>
							<span class="text-dm">{cmd.name}</span>
							<h2 class="text-xs">{cmd.description}</h2>
						</div>
						<PlatformsIcons platforms={cmd.platforms} />
					</div>
					<Separator class="my-3" />
				</li>
			{/each}
		{/if}
	</ul>
</ScrollArea>

<footer class="fixed bottom-0 mb-1 flex h-10 w-full space-x-2 px-2" use:autoAnimate>
	{#if showBtn.upgrade}
		{@render upgradeBtn()}
	{/if}
	{#if showBtn.uninstall}
		{@render uninstallBtn()}
	{/if}
	{#if showBtn.install}
		{@render installBtn()}
	{/if}
</footer>
