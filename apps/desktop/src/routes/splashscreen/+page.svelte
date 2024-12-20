<script lang="ts">
	import Dance from "@/components/dance/dance.svelte"
	import { cn } from "@/utils"
	import { Command, Skeleton } from "@kksh/svelte5"
	import { CustomCommandInput } from "@kksh/ui/main"
	import { getCurrentWindow } from "@tauri-apps/api/window"
	import { onMount } from "svelte"

	onMount(async () => {
		const mainWin = await getCurrentWindow()
		mainWin.show()
	})
</script>

<main class="h-screen" data-tauri-drag-region>
	<Dance class="h-full w-full" />
</main>
