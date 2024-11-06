<script lang="ts">
	import { IconEnum } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { DraggableCommandGroup } from "../custom"
	import type { BuiltinCmd } from "./types"

	const { builtinCmds }: { builtinCmds: BuiltinCmd[] } = $props()
</script>

<DraggableCommandGroup heading="Builtin Commands">
	{#each builtinCmds as cmd}
		<Command.Item
			class="flex justify-between"
			onSelect={() => {
				cmd.function()
			}}
		>
			<span class="flex gap-2">
				<IconMultiplexer
					icon={{ value: cmd.iconifyIcon, type: IconEnum.Iconify }}
					class="!h-5 !w-5 shrink-0"
				/>
				<span>{cmd.name}</span>
			</span>
		</Command.Item>
	{/each}
</DraggableCommandGroup>
