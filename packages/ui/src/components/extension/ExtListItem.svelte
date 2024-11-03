<script lang="ts">
	import Icon from "@iconify/svelte"
	import { Icon as TIcon } from "@kksh/api/models"
	import { ExtItem } from "@kksh/supabase"
	import { Button, Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { humanReadableNumber } from "@kksh/utils"
	import { greaterThan, parse as parseSemver } from "@std/semver"
	import { CircleCheckBigIcon, MoveRightIcon } from "lucide-svelte"
	import { parse } from "valibot"

	let {
		ext,
		installedVersion,
		onSelect,
		onUpgrade,
		onInstall,
		isUpgradable
	}: {
		ext: ExtItem
		installedVersion?: string
		onSelect: () => void
		onUpgrade: () => void
		onInstall: () => void
		isUpgradable: boolean
	} = $props()
</script>

<Command.Item class="flex items-center justify-between" {onSelect}>
	<span class="flex items-center space-x-2">
		<IconMultiplexer icon={parse(TIcon, ext.icon)} class="!h-6 !w-6 shrink-0" />
		<span class="flex flex-col gap-0">
			<div class="font-semibold">{ext.name}</div>
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
