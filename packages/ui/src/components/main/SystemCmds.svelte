<script lang="ts">
	import { CmdTypeEnum, IconEnum, SysCommand } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { confirm } from "@tauri-apps/plugin-dialog"
	import { DraggableCommandGroup } from "../custom"
	import { CmdValue } from "./types"

	const { systemCommands }: { systemCommands: SysCommand[] } = $props()
</script>

<DraggableCommandGroup heading="System Commands">
	{#each systemCommands as cmd}
		<Command.Item
			class="flex justify-between"
			onSelect={async () => {
				if (cmd.confirmRequired) {
					const confirmed = await confirm(`Are you sure you want to run ${cmd.name}?`)
					if (confirmed) {
						cmd.function()
					}
				}
			}}
			value={JSON.stringify({
				cmdName: cmd.name,
				cmdType: CmdTypeEnum.System
			} satisfies CmdValue)}
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
