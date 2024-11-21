<script lang="ts">
	import { ListSchema } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "../../common"

	const { item, onSelect }: { item: ListSchema.Item; onSelect?: () => void } = $props()
</script>

<Command.Item class="gap-2" {onSelect} value={JSON.stringify(item)}>
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
