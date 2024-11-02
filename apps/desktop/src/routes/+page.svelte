<script lang="ts">
	import { commandLaunchers } from "@/cmds"
	import { builtinCmds } from "@/cmds/builtin"
	import IconMultiplexer from "@/components/common/IconMultiplexer.svelte"
	import Cmd from "@/components/main/cmd.svelte"
	import CommandPalette from "@/components/main/CommandPalette.svelte"
	import { appState } from "@/stores"
	import { appConfig } from "@/stores/appConfig"
	import { extensions } from "@/stores/extensions"
	import Icon from "@iconify/svelte"
	import { CustomUiCmd, ExtPackageJsonExtra, IconEnum, TemplateUiCmd } from "@kksh/api/models"
	import { loadAllExtensionsFromDb } from "@kksh/extensions"
	import { Button } from "@kksh/svelte5"
	import * as tauriPath from "@tauri-apps/api/path"
	import { load, Store } from "@tauri-apps/plugin-store"
	import { onMount } from "svelte"
	import { writable } from "svelte/store"
</script>

<CommandPalette
	extensions={$extensions}
	{appState}
	class="h-screen"
	{commandLaunchers}
	{builtinCmds}
/>
