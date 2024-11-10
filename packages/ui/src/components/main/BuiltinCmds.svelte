<script lang="ts">
	import { CmdTypeEnum, IconEnum } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { DraggableCommandGroup } from "../custom"
	import type { BuiltinCmd, CmdValue } from "./types"

	const { builtinCmds }: { builtinCmds: BuiltinCmd[] } = $props()
</script>

<DraggableCommandGroup heading="Builtin Commands">
	{#each builtinCmds as cmd}
		<Command.Item
			class="flex justify-between"
			onSelect={() => {
				cmd.function()
			}}
			value={JSON.stringify({
				cmdName: cmd.name,
				cmdType: CmdTypeEnum.Builtin
			} satisfies CmdValue)}
		>
			<span class="flex gap-2">
				<IconMultiplexer
					icon={{ value: cmd.iconifyIcon, type: IconEnum.Iconify }}
					class="!h-5 !w-5 shrink-0"
				/>
				<span>{cmd.name}</span>
				<!-- <pre>{JSON.stringify({
						cmdName: cmd.name,
						cmdType: CmdTypeEnum.Builtin
					})}</pre> -->
			</span>
		</Command.Item>
	{/each}
</DraggableCommandGroup>
