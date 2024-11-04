<script lang="ts">
	import { IconEnum, SysCommand } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { DraggableCommandGroup } from "@kksh/ui/custom"

	const { systemCommands }: { systemCommands: SysCommand[] } = $props()
</script>

<DraggableCommandGroup heading="System Commands">
	{#each systemCommands as cmd}
		<Command.Item
			class="flex justify-between"
			onSelect={() => {
				cmd.function()
			}}
		>
			<span class="flex gap-2">
				{#if cmd.icon}
					<IconMultiplexer icon={cmd.icon} class="!h-5 !w-5 shrink-0" />
				{/if}
				<span>{cmd.name}</span>
			</span>
		</Command.Item>
	{/each}
</DraggableCommandGroup>
