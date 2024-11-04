<script lang="ts">
	import { onMount } from "svelte"

	const { frame, class: className }: { frame: number[][]; class?: string } = $props()

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D | null
	const PIXEL_SIZE = 4 // Size of each pixel square

	$effect(() => {
		if (!canvas || !frame.length) return

		const rows = frame.length
		const cols = frame[0]?.length ?? 0

		// Set canvas size
		canvas.width = cols * PIXEL_SIZE
		canvas.height = rows * PIXEL_SIZE

		ctx = canvas.getContext("2d")
		if (!ctx) return

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		// Draw pixels
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const color = frame[i]?.[j] === 0 ? "black" : "white"
				ctx.fillStyle = color
				ctx.fillRect(j * PIXEL_SIZE, i * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
			}
		}
	})
</script>

<canvas bind:this={canvas} class={className}></canvas>
