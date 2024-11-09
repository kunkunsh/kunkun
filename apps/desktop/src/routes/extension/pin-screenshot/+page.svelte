<script lang="ts">
	import { Button } from "@kksh/svelte5"
	import { Layouts } from "@kksh/ui"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { CircleX } from "lucide-svelte"
	import { onMount } from "svelte"
	import * as clipboard from "tauri-plugin-clipboard-api"

	let image: string | null = null
	const appWin = getCurrentWebviewWindow()

	onMount(() => {
		clipboard.readImageBase64().then((b64) => {
			image = b64
		})
	})
</script>

<Button size="icon" variant="ghost" class="fixed left-2 top-2" onclick={() => appWin.close()}
	><CircleX /></Button
>
<main class="h-screen w-screen overflow-hidden z-50" data-tauri-drag-region>
	{#if image}
		<img
			src={`data:image/png;base64,${image}`}
			alt="screenshot"
			class="h-full w-full object-contain pointer-events-none"
		/>
	{:else}
		<Layouts.Center>
			<p class="text-2xl font-bold">No image found in clipboard</p>
		</Layouts.Center>
	{/if}
</main>
