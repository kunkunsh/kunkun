<script lang="ts">
	import { commandLaunchers } from "@/cmds"
	import { builtinCmds } from "@/cmds/builtin"
	import CommandPalette from "@/components/main/CommandPalette.svelte"
	import { appState } from "@/stores"
	import { appConfig } from "@/stores/appConfig"
	import { extensions } from "@/stores/extensions"
	import "@kksh/ui"
</script>

<CommandPalette
	class="h-screen"
	extensions={$extensions}
	{appState}
	{appConfig}
	{commandLaunchers}
	{builtinCmds}
/>
