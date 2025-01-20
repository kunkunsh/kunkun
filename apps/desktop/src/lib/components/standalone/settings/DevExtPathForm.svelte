<script lang="ts">
	import * as m from "@/paraglide/messages"
	import { appConfig } from "@/stores"
	import Icon from "@iconify/svelte"
	import { Button, Input } from "@kksh/svelte5"
	import { open } from "@tauri-apps/plugin-dialog"
	import { exists } from "@tauri-apps/plugin-fs"
	import { toast } from "svelte-sonner"

	let devExtPath = $state<string | undefined>(undefined)

	async function pickDirectory() {
		const dir = await open({
			multiple: false,
			directory: true
		})
		if (dir && (await exists(dir))) {
			devExtPath = dir
			appConfig.setDevExtensionPath(dir)
		} else {
			return toast.error("Invalid Path")
		}
	}

	function clear() {
		devExtPath = undefined
		appConfig.setDevExtensionPath(null)
	}
</script>

<form class="flex w-full items-center space-x-2">
	<Input
		disabled
		type="text"
		placeholder={m.settings_set_dev_ext_enter_path()}
		bind:value={$appConfig.devExtensionPath}
	/>
	<Button size="sm" type="button" onclick={clear}>
		{m.common_clear()}
		<Icon icon="material-symbols:delete-outline" class="ml-1 h-5 w-5" />
	</Button>
	<Button size="sm" type="button" onclick={pickDirectory}>
		{m.common_edit()}
		<Icon icon="flowbite:edit-outline" class="ml-1 h-5 w-5" />
	</Button>
</form>
