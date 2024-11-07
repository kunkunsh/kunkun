<script lang="ts">
	import type { QuickLinkQuery } from "@/stores"
	import { IconEnum } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { DraggableCommandGroup } from "../custom"

	const { quickLinks }: { quickLinks: QuickLinkQuery[] } = $props()
</script>

<DraggableCommandGroup heading="Quick Links">
	{#each quickLinks as cmd}
		<Command.Item
			class="flex justify-between"
			onSelect={() => {
				console.log(cmd)
			}}
			value={JSON.stringify({ cmdName: cmd.name })}
		>
			<span class="flex gap-2">
				<!-- <IconMultiplexer
					icon={{ value: cmd.value, type: IconEnum.RemoteUrl }}
					class="!h-5 !w-5 shrink-0"
				/> -->
				<span>{cmd.name}</span>
			</span>
		</Command.Item>
	{/each}
</DraggableCommandGroup>
