<script lang="ts">
	import { appConfig } from "@/stores"
	import Icon from "@iconify/svelte"
	import { Button, Input } from "@kksh/svelte5"
	import { open } from "@tauri-apps/plugin-dialog"
	import { exists } from "@tauri-apps/plugin-fs"
	import { toast } from "svelte-sonner"
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms"
	import { zodClient } from "sveltekit-superforms/adapters"
	import { z } from "zod"

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
	<Input disabled type="text" placeholder="Enter Path" bind:value={$appConfig.devExtensionPath} />
	<Button size="sm" type="button" onclick={clear}>
		Clear
		<Icon icon="material-symbols:delete-outline" class="ml-1 h-5 w-5" />
	</Button>
	<Button size="sm" type="button" onclick={pickDirectory}>
		Edit
		<Icon icon="flowbite:edit-outline" class="ml-1 h-5 w-5" />
	</Button>
</form>
