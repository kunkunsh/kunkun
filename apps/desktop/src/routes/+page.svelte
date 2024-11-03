<script lang="ts">
	import { commandLaunchers } from "@/cmds"
	import { builtinCmds } from "@/cmds/builtin"
	import { appState } from "@/stores"
	import { appConfig } from "@/stores/appConfig"
	import { extensions } from "@/stores/extensions"
	import { CommandPalette } from "@kksh/ui/main"
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
