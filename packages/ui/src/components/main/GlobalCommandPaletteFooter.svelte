<script lang="ts">
	import Icon from "@iconify/svelte"
	import { Action as ActionSchema } from "@kksh/api/models"
	import { Avatar, Button } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import Kbd from "../common/Kbd.svelte"
	import ActionPanel from "./ActionPanel.svelte"

	const {
		class: className,
		defaultAction,
		actionPanel,
		onDefaultActionSelected,
		onActionSelected
	}: {
		class?: string
		defaultAction?: string
		actionPanel?: ActionSchema.ActionPanel
		onDefaultActionSelected?: () => void
		onActionSelected?: (value: string) => void
	} = $props()
</script>

<flex
	data-tauri-drag-region
	class={cn("h-12 select-none items-center justify-between gap-4 border-t px-2", className)}
>
	<Avatar.Root class="p-1.5">
		<Avatar.Image
			src="/favicon.png"
			alt="Kunkun Logo"
			class="h-full select-none invert dark:invert-0"
		/>
	</Avatar.Root>
	<flex class="items-center gap-1">
		{#if defaultAction}
			<Button size="default" class="h-full" variant="ghost" onclick={onDefaultActionSelected}>
				{defaultAction}
				<Kbd><Icon icon="tdesign:enter" /></Kbd>
			</Button>
		{/if}
		{#if actionPanel}
			<ActionPanel {actionPanel} {onActionSelected} />
		{/if}
	</flex>
</flex>
