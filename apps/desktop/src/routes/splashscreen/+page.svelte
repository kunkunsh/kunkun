<script lang="ts">
	import { Layouts } from "@kksh/ui"
	import { getCurrentWindow } from "@tauri-apps/api/window"
	import { onMount } from "svelte"

	onMount(async () => {
		const mainWin = await getCurrentWindow()
		mainWin.show()
	})
</script>

<Layouts.Center class="h-screen w-screen">
	<div class="animate-zoom-in flex flex-col items-center justify-center gap-2 pb-20">
		<img src="/favicon.png" alt="Logo" />
		<h2 class="font-mono text-2xl font-extrabold">Kunkun</h2>
	</div>
</Layouts.Center>

<style scoped>
	.animate-zoom-in {
		animation: zoom-in 0.2s ease-in-out;
	}

	@keyframes zoom-in {
		from {
			transform: scale(0);
		}
		to {
			transform: scale(1);
		}
	}
</style>
