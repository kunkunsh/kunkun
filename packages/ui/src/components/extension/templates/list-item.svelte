<script lang="ts">
	import { ListSchema } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "../../common"

	const {
		item,
		class: className,
		onSelect,
		translateY,
		height
	}: {
		item: ListSchema.Item
		onSelect?: () => void
		translateY?: number
		height?: number
		class?: string
	} = $props()
</script>

<Command.Item
	class="debugitem gap-2 {className}"
	{onSelect}
	value={item.value}
	style="position: absolute; top: 0; left: 0; width: 100%; height: {height}px; transform: translateY({translateY}px);"
>
	{#if item.icon}
		<IconMultiplexer icon={item.icon} class="h-5 w-5" />
	{/if}
	<span class="truncate">{item.title}</span>
	<span class="text-muted-foreground">{item.subTitle}</span>
	<Command.Shortcut>
		<div class="flex gap-2">
			{#each item.accessories ?? [] as acc}
				<span class="flex items-center gap-1">
					{#if acc.icon}
						<IconMultiplexer icon={acc.icon} class="h-4 w-4" />
					{/if}
					<span>{acc.text}</span>
				</span>
			{/each}
		</div>
	</Command.Shortcut>
</Command.Item>
