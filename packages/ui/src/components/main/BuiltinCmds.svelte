<script lang="ts">
	import { CmdTypeEnum, IconEnum } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { DraggableCommandGroup } from "../custom"
	import type { BuiltinCmd, CmdValue } from "./types"

	const { builtinCmds }: { builtinCmds: BuiltinCmd[] } = $props()
</script>

<DraggableCommandGroup heading="Builtin Commands">
	{#each builtinCmds as cmd (cmd.id)}
		<Command.Item
			class="flex justify-between"
			onSelect={() => {
				cmd.function()
			}}
			value={JSON.stringify({
				cmdName: cmd.name,
				cmdType: CmdTypeEnum.Builtin
			} satisfies CmdValue)}
			keywords={cmd.keywords}
		>
			<span class="flex gap-2">
				<IconMultiplexer icon={cmd.icon} class="!h-5 !w-5 shrink-0" />
				<span>{cmd.name}</span>
			</span>
		</Command.Item>
	{/each}
</DraggableCommandGroup>
