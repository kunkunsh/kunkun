<script lang="ts">
	import createGlobe from "cobe"
	import { onMount } from "svelte"
	import { Spring, spring } from "svelte/motion"
	import { cn } from "../../utils"

	let x = spring(0, {
		stiffness: 0.04,
		damping: 0.4,
		precision: 0.005
	})

	// let className = ""
	// export { className as class }
	let { locations, class: className }: { class?: string; locations?: [number, number][] } = $props()
	let pointerInteracting: number | null = null
	let pointerInteractionMovement = 0
	let canvas: HTMLCanvasElement

	let phi = 0
	let width = 0
	// $: console.log(width, "X")
	let onResize = () => {
		width = canvas.offsetWidth
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let onRender = (state: Record<string, any>) => {
		if (!pointerInteracting) {
			phi += 0.005
		}
		state.phi = phi + $x
		state.width = width * 2
		state.height = width * 2
	}

	onMount(() => {
		// Adds the resize event listener when the component is mounted
		window.addEventListener("resize", onResize)
		onResize()

		// Initializes the globe with specific options
		const globe = createGlobe(canvas, {
			devicePixelRatio: 2,
			width: width,
			height: width,
			phi: 0,
			theta: 0.3,
			dark: 1,
			diffuse: 0.4, // 1.2
			mapSamples: 16000,
			mapBrightness: 1.2, // 6
			baseColor: [0.3, 0.3, 0.3],
			markerColor: [251 / 255, 100 / 255, 21 / 255],
			glowColor: [1, 1, 1],
			markers: locations
				? locations.map((location) => {
						return {
							location: location,
							size: 0.03
						}
					})
				: [
						{ location: [14.5995, 120.9842], size: 0.03 },
						{ location: [19.076, 72.8777], size: 0.03 },
						{ location: [23.8103, 90.4125], size: 0.05 },
						{ location: [30.0444, 31.2357], size: 0.07 },
						{ location: [39.9042, 116.4074], size: 0.08 },
						{ location: [-23.5505, -46.6333], size: 0.05 },
						{ location: [19.4326, -99.1332], size: 0.04 },
						{ location: [40.7128, -74.006], size: 0.1 },
						{ location: [34.6937, 135.5022], size: 0.05 },
						{ location: [41.0082, 28.9784], size: 0.06 }
					],
			// onRender: (state) => {
			//   if (!pointerInteracting) {
			//     // Called on every animation frame.
			//     // `state` will be an empty object, return updated params.
			//     phi += 0.009;
			//   }
			//   state.phi = phi + $x;

			//   // phi += 0.01;
			// },
			onRender: onRender
		})

		// Removes the resize event listener when the component is unmounted to prevent memory leaks
		return () => {
			window.removeEventListener("resize", onResize)
		}
	})
</script>

<main class={cn("absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]", className)}>
	<canvas
		class="h-full w-full [contain:layout_paint_size]"
		bind:this={canvas}
		onpointerdown={(e) => {
			pointerInteracting = e.clientX - pointerInteractionMovement
			canvas.style.cursor = "grabbing"
		}}
		onpointerup={() => {
			pointerInteracting = null
			canvas.style.cursor = "grab"
		}}
		onpointerout={() => {
			pointerInteracting = null
			canvas.style.cursor = "grab"
		}}
		onmousemove={(e) => {
			if (pointerInteracting !== null) {
				console.log("working")
				const delta = e.clientX - pointerInteracting
				pointerInteractionMovement = delta
				x.set(delta / 200)
			}
		}}
	></canvas>
</main>
