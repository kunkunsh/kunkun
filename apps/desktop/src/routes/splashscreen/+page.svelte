<script lang="ts">
	import { Layouts } from "@kksh/ui"
	import { getCurrentWindow } from "@tauri-apps/api/window"
	import { goto } from "$app/navigation"
	import { onMount } from "svelte"

	onMount(async () => {
		const mainWin = await getCurrentWindow()
		await mainWin.show()
		goto("/")
	})
</script>

<div class="h-screen w-screen" data-tauri-drag-region>
	<Layouts.Center class="h-full">
		<div class="animate-zoom-in flex flex-col items-center justify-center gap-2 pb-20">
			<img src="/favicon.png" alt="Logo" />
			<h2 class="font-mono text-2xl font-extrabold">Kunkun</h2>
		</div>
	</Layouts.Center>
</div>
