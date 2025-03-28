<script lang="ts">
	import { CmdTypeEnum, IconEnum, SysCommand } from "@kksh/api/models"
	import { Command, IconMultiplexer } from "@kksh/ui"
	import { DraggableCommandGroup } from "../custom"
	import { CmdValue } from "./types"

	const {
		systemCommands,
		onConfirm
	}: { systemCommands: SysCommand[]; onConfirm?: (cmd: SysCommand) => Promise<boolean> } = $props()
</script>

<DraggableCommandGroup heading="System Commands">
	{#each systemCommands as cmd (`system-cmds-${cmd.name}`)}
		<Command.Item
			class="flex justify-between"
			onSelect={async () => {
				if (cmd.confirmRequired) {
					const confirmed = onConfirm ? await onConfirm?.(cmd) : true
					if (confirmed) {
						cmd.function()
					}
				} else {
					cmd.function()
				}
			}}
			value={cmd.name}
		>
			<!-- value={JSON.stringify({
				cmdName: cmd.name,
				cmdType: CmdTypeEnum.System
			} satisfies CmdValue)} -->
			<span class="flex gap-2">
				{#if cmd.icon}
					<IconMultiplexer icon={cmd.icon} class="!h-5 !w-5 shrink-0" />
				{/if}
				<span>{cmd.name}</span>
			</span>
		</Command.Item>
	{/each}
</DraggableCommandGroup>
