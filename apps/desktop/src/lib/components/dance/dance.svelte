<script lang="ts">
	import { cn } from "@/utils"
	import { GridAnimation } from "@kksh/ui"
	import { decompressFrame, decompressString, deserializeFrame } from "@kksh/utils"
	import compressedDance from "$lib/../data/dance.bin?raw"

	const rawData = JSON.parse(decompressString(compressedDance))
	const { fps, frames: rawFrames }: { fps: number; frames: string[] } = rawData
	const decodedFrames = rawFrames.map((frame) => deserializeFrame(decompressFrame(frame)))

	let { scale = 1, class: className }: { scale?: number; class?: string } = $props()
</script>

<GridAnimation
	class={cn(
		"pointer-events-none max-h-full max-w-full select-none invert dark:invert-0",
		className
	)}
	{fps}
	frames={decodedFrames}
	{scale}
/>
