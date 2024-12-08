<script lang="ts">
	import Icon from "@iconify/svelte"
	import { Icon as TIcon } from "@kksh/api/models"
	import { SBExt } from "@kksh/api/supabase"
	import { Button, Command } from "@kksh/svelte5"
	import { Constants, IconMultiplexer } from "@kksh/ui"
	import { cn, humanReadableNumber } from "@kksh/ui/utils"
	import { greaterThan, parse as parseSemver } from "@std/semver"
	import { CircleCheckBigIcon, MoveRightIcon } from "lucide-svelte"
	import { parse } from "valibot"

	let {
		ext,
		installedVersion,
		onSelect,
		onUpgrade,
		onInstall,
		isUpgradable,
		class: className
	}: {
		class?: string
		ext: SBExt
		installedVersion?: string
		onSelect: () => void
		onUpgrade: () => void
		onInstall: () => void
		isUpgradable: boolean
	} = $props()
</script>

<Command.Item class={cn("flex items-center justify-between", className)} {onSelect}>
	<span class="flex items-center space-x-2">
		<span class="!h-6 !w-6">
			<IconMultiplexer
				icon={parse(TIcon, ext.icon)}
				class={cn(Constants.CLASSNAMES.EXT_LOGO, "!h-6 !w-6 shrink-0")}
				data-flip-id={`${Constants.CLASSNAMES.EXT_LOGO}-${ext.identifier}`}
			/>
		</span>
		<span class="flex flex-col gap-0">
			<div class="ext-name font-semibold">{ext.name}</div>
			<small class="text-muted-foreground font-mono">{ext.short_description}</small>
		</span>
	</span>

	<span class="flex items-center space-x-3">
		{#if installedVersion}
			{@const upgradable = ext.version
				? greaterThan(parseSemver(ext.version), parseSemver(installedVersion))
				: false}
			{#if upgradable}
				<Button
					variant="outline"
					size="sm"
					class="flex items-center space-x-1 border border-yellow-600 px-2"
					onclick={(e: MouseEvent) => {
						e.stopPropagation()
						onUpgrade()
					}}
				>
					<Icon icon="carbon:upgrade" class="inline h-5 w-5" />
					<small>{installedVersion}</small>
					<MoveRightIcon class="w-4" />
					<small>{ext.version}</small>
				</Button>
			{:else}
				<CircleCheckBigIcon class="w-4 text-green-400" />
				<small>{ext.version}</small>
			{/if}
		{:else}
			<Button
				variant="ghost"
				size="icon"
				onclick={(e: MouseEvent) => {
					e.stopPropagation()
					onInstall()
				}}
			>
				<Icon icon="ic:round-download" class="inline h-5 w-5" />
			</Button>
		{/if}
		<span class="w-4 text-center font-mono">{humanReadableNumber(ext.downloads)}</span>
	</span>
</Command.Item>

<style>
	/* .ext-logo-image {
		view-transition-name: var(--ext-logo-img);
	} */
</style>
