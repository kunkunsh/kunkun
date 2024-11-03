<script lang="ts">
	import { onMount } from "svelte"

	let {
		fps,
		frames,
		pixelColor = "white",
		scale = 1,
		canvas = $bindable<HTMLCanvasElement>(),
		class: className
	}: {
		fps: number
		frames: number[][][]
		pixelColor?: string
		scale?: number
		canvas?: HTMLCanvasElement
		class?: string
	} = $props()

	let ctx: CanvasRenderingContext2D | null
	let frameIdx = $state(0)
	let frameHeight = $derived(frames[0]?.length ?? 0)
	let frameWidth = $derived(frames[0]?.[0]?.length ?? 0)
	let nFrames = $derived(frames.length)
	let frame = $derived(frames[frameIdx] ?? [])
	const basePixelSize = 10
	let pixelSize = $derived(basePixelSize * scale)
	const frameInterval = $derived(1000 / fps)
	let canvasWidth = $derived(frameWidth * pixelSize)
	let canvasHeight = $derived(frameHeight * pixelSize)

	function drawFrame() {
		if (!canvas || !ctx) return
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		for (let y = 0; y < frameHeight; y++) {
			for (let x = 0; x < frameWidth; x++) {
				ctx.fillStyle = frame[y]?.[x] === 1 ? pixelColor : "transparent"
				ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
			}
		}
		frameIdx = (frameIdx + 1) % nFrames
	}

	onMount(() => {
		frameIdx = Math.floor(Math.random() * nFrames)
		ctx = canvas.getContext("2d")
		let lastTime = 0

		function animate(time: number) {
			if (time - lastTime >= frameInterval) {
				drawFrame()
				lastTime = time
			}
			requestAnimationFrame(animate)
		}
		requestAnimationFrame(animate)
	})
</script>

<canvas bind:this={canvas} width={canvasWidth} height={canvasHeight} class={className}></canvas>
