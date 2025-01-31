<script lang="ts">
	import autoAnimate from "@formkit/auto-animate"
	import moment from 'moment'
	import Icon from "@iconify/svelte"
	import { ExtPackageJson, IconEnum, KunkunExtManifest } from "@kksh/api/models"
	import { ExtPublishMetadata, ExtPublishSourceTypeEnum } from "@kksh/supabase/models"
	import { type Tables } from "@kksh/supabase/types"
	import { Badge, Button, ScrollArea, Separator } from "@kksh/svelte5"
	import { Constants, IconMultiplexer } from "@kksh/ui"
	import { cn } from "@kksh/ui/utils"
	import { CircleCheckBigIcon, MoveRightIcon, Trash2Icon } from "lucide-svelte"
	import prettyBytes from "pretty-bytes"
	import * as v from "valibot"
	import DialogImageCarousel from "../common/DialogImageCarousel.svelte"
	import PlatformsIcons from "../common/PlatformsIcons.svelte"
	import TauriLink from "../common/TauriLink.svelte"
	import GitHubProvenanceCard from "./GitHubProvenanceCard.svelte"
	import PermissionInspector from "./PermissionInspector.svelte"
	import Markdown from "./templates/Markdown.svelte"
	import { isInTauri } from "../../utils/tauri"

	let {
		extPublish,
		ext,
		author,
		installedExt,
		manifest,
		demoImages,
		class: className,
		onEnterPressed,
		onInstallSelected,
		onUpgradeSelected,
		onUninstallSelected,
		packageJson,
		showBtn,
		loading,
		imageDialogOpen = $bindable(false)
	}: {
		extPublish: Tables<"ext_publish">
		ext: Tables<"extensions">
		author?: {
			id: string,
			name: string
		} | null,
		installedExt?: ExtPackageJson
		packageJson: ExtPackageJson | null
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

	const metadata = $derived.by(() => {
		const parseRes = v.safeParse(ExtPublishMetadata, extPublish.metadata)
		if (!parseRes.success) {
			console.error(v.flatten(parseRes.issues))
			return
		}
		return parseRes.output
	})
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
			<small>{extPublish.version}</small>
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

{#snippet person(author: ExtPackageJson["author"])}
	{#if author}
		{#if typeof author === "string"}
			<span>{author}</span>
		{:else if author.url}
			<TauriLink href={author.url}>{author.name}</TauriLink>
		{:else}
			<span>{author.name}</span>
		{/if}
	{/if}
{/snippet}

<div data-tauri-drag-region class="h-14"></div>
<ScrollArea class={cn("w-full pb-12", className)}>
	<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
		<div class="flex items-center gap-4">
			<span class="h-20 w-20">
				<IconMultiplexer
					icon={manifest.icon}
					class={cn(Constants.CLASSNAMES.EXT_LOGO, "h-full w-full")}
					data-flip-id={`${Constants.CLASSNAMES.EXT_LOGO}-${extPublish.identifier}`}
				/>
			</span>
			<div class="flex flex-col justify-center">
				<span class="flex w-full items-center" use:autoAnimate>
					<strong class="ext-name text-xl">{manifest?.name}</strong>
					{#if isInstalled}
						<CircleCheckBigIcon class="ml-2 inline text-green-400" />
					{/if}
				</span>
				<pre class="text-muted-foreground text-xs">{extPublish.identifier}</pre>
				<pre class="text-muted-foreground text-xs">Version: {extPublish.version}</pre>
				<pre class="text-muted-foreground text-xs">Downloads: {ext.downloads}</pre>
				<pre class="text-muted-foreground text-xs">Size: {prettyBytes(extPublish.tarball_size)}</pre>
				<pre class="text-muted-foreground text-xs">Published At: {moment(new Date(extPublish.created_at)).format('YYYY-MM-DD HH:mm')}</pre>
			</div>
		</div>
		<div class="flex items-center space-x-2">
			{#if metadata && metadata.sourceType === ExtPublishSourceTypeEnum.jsr}
				<a href={metadata.source} target="_blank">
					<Icon class="h-10 w-10" icon="vscode-icons:file-type-jsr" />
				</a>
			{:else if metadata && metadata.sourceType === ExtPublishSourceTypeEnum.npm}
				<a href={metadata.source} target="_blank">
					<Icon class="h-10 w-10" icon="vscode-icons:file-type-npm" />
				</a>
			{/if}
			{#if metadata && metadata?.git?.commit && metadata?.rekorLogIndex && metadata?.git?.owner && metadata?.git?.repo}
				<a
					href={`https://github.com/${metadata.git.owner}/${metadata.git.repo}/tree/${metadata.git.commit}`}
					target="_blank"
				>
					<Badge class="h-8 space-x-2" variant="secondary">
						<Icon class="h-6 w-6" icon="mdi:github" />
						<span>{metadata.git.owner}/{metadata.git.repo}</span>
					</Badge>
				</a>
			{/if}
		</div>
	</div>
	{#if metadata && metadata?.git?.commit && metadata?.rekorLogIndex && metadata?.git?.owner && metadata?.git?.repo}
		<Separator class="my-3" />
		<GitHubProvenanceCard
			repoOwner={metadata.git.owner}
			repoName={metadata.git.repo}
			githubActionInvocationId={metadata.git.githubActionInvocationId}
			commit={metadata.git.commit}
			rekorLogIndex={metadata.rekorLogIndex}
			workflowPath={metadata.git.workflowPath}
		/>
	{/if}
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
	<div class="grid grid-cols-3 gap-4">
		<div class="col-span-2">
			<h2 class="text-lg font-bold">Commands</h2>
			<ul>
				{#if manifest}
					{#each [...(manifest.customUiCmds ?? []), ...(manifest.templateUiCmds ?? [])] as cmd}
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
		</div>
		<div>
			<h2 class="text-lg font-bold">Publisher Profile</h2>
			{#if !isInTauri && author}
				<ul class="list-disc pl-5">
					<li><a class='text-blue-500 hover:text-blue-600' href={`/user/${author.id}`}>{author.name}</a></li>
				</ul>
			{:else}
				<TauriLink href={`https://kunkun.sh/user/${ext.author_id}`}>{ext.author_id}</TauriLink>
			{/if}
			<h2 class="text-lg font-bold">Author</h2>
			{#if packageJson?.author}
				<ul class="list-disc pl-5">
					<li>{@render person(packageJson?.author)}</li>
				</ul>
			{:else}
				<span>N/A</span>
			{/if}
			<br />
			<h2 class="text-lg font-bold">Contributors</h2>
			<ul class="list-disc pl-5">
				{#each packageJson?.contributors ?? [] as contributor}
					<li>{@render person(contributor)}</li>
				{/each}
			</ul>
		</div>
	</div>
	<Separator class="my-3" />
	<h2 class="text-lg font-bold">README</h2>
	{#if extPublish?.readme}
		<Markdown markdown={extPublish.readme} class="bg-secondary max-w-full rounded-md p-4" />
	{/if}
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
