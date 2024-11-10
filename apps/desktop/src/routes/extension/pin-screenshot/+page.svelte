<script lang="ts">
	import { Button } from "@kksh/svelte5"
	import { Layouts } from "@kksh/ui"
	import { LogicalSize } from "@tauri-apps/api/dpi"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { CircleX } from "lucide-svelte"
	import { onMount } from "svelte"
	import * as clipboard from "tauri-plugin-clipboard-api"

	let image = $state<string | null>(null)
	const appWin = getCurrentWebviewWindow()
	let originalSize = $state<{ width: number; height: number } | null>(null)
	let originalScaleFactor = $state<number | null>(null)
	let scale = $state<number>(1)
	let currentSize = $derived(
		originalSize ? { width: originalSize.width * scale, height: originalSize.height * scale } : null
	)

	$effect(() => {
		if (currentSize) {
			appWin.setSize(new LogicalSize(currentSize.width, currentSize.height))
		}
	})

	async function getWindowSize() {
		const size = await appWin.outerSize()
		const scaleFactor = originalScaleFactor ?? (await appWin.scaleFactor())
		const logicalSize = size.toLogical(scaleFactor)
		return { logicalSize, scaleFactor }
	}

	onMount(async () => {
		clipboard
			.readImageBase64()
			.then((b64) => {
				image = b64
			})
			.finally(() => {
				appWin.show()
			})
		const { logicalSize, scaleFactor } = await getWindowSize()
		originalSize = { width: logicalSize.width, height: logicalSize.height }
		originalScaleFactor = scaleFactor
	})

	async function onWheel(e: WheelEvent) {
		scale += (e.deltaY < 0 ? 1 : -1) * 0.05
	}

	function onGestureChange(e: any) {
		e.preventDefault()
		scale = e.scale
	}

	$effect(() => {
		document.addEventListener("wheel", onWheel)
		document.addEventListener("gesturechange", onGestureChange)

		return () => {
			document.removeEventListener("wheel", onWheel)
			document.removeEventListener("gesturechange", onGestureChange)
		}
	})
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "Escape") {
			appWin.close()
		}
	}}
/>
<Button size="icon" variant="ghost" class="fixed left-2 top-2" onclick={() => appWin.close()}
	><CircleX /></Button
>
<main class="z-50 h-screen w-screen overflow-hidden" data-tauri-drag-region>
	{#if image}
		<img
			src={`data:image/png;base64,${image}`}
			alt="screenshot"
			class="pointer-events-none h-full w-full object-contain"
		/>
	{:else}
		<Layouts.Center>
			<p class="text-2xl font-bold">No image found in clipboard</p>
		</Layouts.Center>
	{/if}
</main>
