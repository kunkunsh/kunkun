<!-- This file renders a group of extension commands -->
<!-- Input props to this component is an array of ExtPackageJsonExtra[] -->
<script lang="ts">
	import { CmdTypeEnum, CustomUiCmd, ExtPackageJsonExtra, TemplateUiCmd } from "@kksh/api/models"
	import { Badge, Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { DraggableCommandGroup } from "../custom"
	import type { CmdValue, OnExtCmdSelect } from "./types"

	const {
		extensions,
		heading,
		isDev,
		hmr,
		onExtCmdSelect
	}: {
		extensions: ExtPackageJsonExtra[]
		heading: string
		isDev: boolean
		hmr: boolean
		onExtCmdSelect: OnExtCmdSelect
	} = $props()
</script>

{#snippet cmd(ext: ExtPackageJsonExtra, cmd: CustomUiCmd | TemplateUiCmd)}
	<Command.Item
		class="flex justify-between"
		onSelect={() => {
			onExtCmdSelect(ext, cmd, { isDev, hmr })
		}}
		value={JSON.stringify({
			cmdName: cmd.name,
			cmdType: cmd.type,
			data: { isDev: heading === "Dev Extensions" }
		} satisfies CmdValue)}
	>
		<span class="flex gap-2">
			<IconMultiplexer icon={cmd.icon ?? ext.kunkun.icon} class="!h-5 !w-5 shrink-0" />
			<span>{cmd.name}</span>
		</span>
		<span class="flex gap-1">
			{#if isDev}
				<Badge class="scale-75 rounded-sm bg-green-500 px-1">Dev</Badge>
			{/if}
			{#if hmr}
				<Badge class="scale-75 rounded-sm px-1">HMR</Badge>
			{/if}
		</span>
	</Command.Item>
{/snippet}

{#snippet ext(ext: ExtPackageJsonExtra)}
	{#each ext.kunkun.customUiCmds as _cmd}
		{@render cmd(ext, _cmd)}
	{/each}
	{#each ext.kunkun.templateUiCmds as _cmd}
		{@render cmd(ext, _cmd)}
	{/each}
{/snippet}

<DraggableCommandGroup {heading}>
	{#each extensions as _ext}
		{@render ext(_ext)}
	{/each}
</DraggableCommandGroup>
