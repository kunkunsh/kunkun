<script lang="ts">
	import { Button, ButtonModule, Popover } from "@kksh/svelte5"
	import { basename } from "@tauri-apps/api/path"
	import { stat } from "@tauri-apps/plugin-fs"
	import { DeleteIcon, FileIcon, FolderIcon, TrashIcon } from "lucide-svelte"
	import { onMount } from "svelte"

	const { filepath, onDelete } = $props()
	let filename = $state("")
	let isDirectory = $state(false)

	onMount(async () => {
		filename = await basename(filepath)
		isDirectory = (await stat(filepath)).isDirectory
	})
</script>

<Popover.Root>
	<Popover.Trigger
		class={ButtonModule.buttonVariants({ variant: "outline", size: "icon", class: "shrink-0" })}
	>
		{#if isDirectory}
			<FolderIcon class="h-8 w-8 shrink-0" />
		{:else}
			<FileIcon class="h-8 w-8 shrink-0" />
		{/if}
	</Popover.Trigger>

	<Popover.Content class="w-fit space-y-2">
		<pre class="text-xs">{filepath}</pre>
		<Button variant="destructive" size="icon" class="" onclick={onDelete}>
			<TrashIcon />
		</Button>
	</Popover.Content>
</Popover.Root>
