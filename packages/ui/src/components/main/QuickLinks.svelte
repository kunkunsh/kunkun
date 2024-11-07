<script lang="ts">
	import { CmdTypeEnum, IconEnum } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { DraggableCommandGroup } from "../custom"
	import { CmdValue, type CmdQuery, type QuickLink } from "./types"

	const { quickLinks }: { quickLinks: QuickLink[] } = $props()
</script>

<DraggableCommandGroup heading="Quick Links">
	{#each quickLinks as cmd}
		<Command.Item
			class="flex justify-between"
			onSelect={() => {
				console.log(cmd)
			}}
			keywords={["quick", "link"]}
			value={JSON.stringify({
				cmdName: cmd.name,
				cmdType: CmdTypeEnum.QuickLink,
				data: cmd.link
			} satisfies CmdValue)}
		>
			<span class="flex gap-2">
				<IconMultiplexer icon={cmd.icon} class="!h-5 !w-5 shrink-0" />
				<span>{cmd.name}</span>
			</span>
		</Command.Item>
	{/each}
</DraggableCommandGroup>
