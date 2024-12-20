<script lang="ts">
	import { Skeleton } from "@kksh/svelte5"
	import { getCurrentWindow } from "@tauri-apps/api/window"
	import { onMount } from "svelte"

	onMount(async () => {
		const mainWin = await getCurrentWindow()
		mainWin.show()
	})
</script>

<main data-tauri-drag-region class="h-screen">
	<div class="flex items-center space-x-4">
		<Skeleton class="size-12 rounded-full" />
		<div class="space-y-2">
			<Skeleton class="h-4 w-[250px]" />
			<Skeleton class="h-4 w-[200px]" />
		</div>
	</div>
</main>
