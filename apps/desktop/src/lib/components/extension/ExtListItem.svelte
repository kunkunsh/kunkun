<script lang="ts">
	import IconMultiplexer from "@/components/common/IconMultiplexer.svelte"
	import * as Command from "@/components/ui/command"
	import { ExtItem } from "@/supabase"
	import { humanReadableNumber } from "@/utils/format"
	import Icon from "@iconify/svelte"
	import { Icon as TIcon } from "@kksh/api/models"
	import { Button } from "@kksh/svelte5"
	import { CircleCheckBigIcon, MoveRightIcon } from "lucide-svelte"
	import { parse } from "valibot"

	let {
		ext,
		installedVersion,
		onSelect,
		onUpgrade,
		onInstall
	}: {
		ext: ExtItem
		installedVersion?: string
		onSelect: () => void
		onUpgrade: () => void
		onInstall: () => void
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

	<span class="flex items-center space-x-1">
		{#if installedVersion}
			{@const upgradable = installedVersion !== ext.version}
			{#if upgradable}
				<Button
					variant="outline"
					size="xs"
					class="flex items-center space-x-1 px-2"
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
		<span class="w-6 text-center">{humanReadableNumber(ext.downloads)}</span>
	</span>
</Command.Item>
