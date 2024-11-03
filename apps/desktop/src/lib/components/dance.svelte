<script lang="ts">
	import { GridAnimation } from "@kksh/ui"
	import { decompressFrame, decompressString, deserializeFrame } from "@kksh/utils"
	import compressedDance from "$lib/../data/dance.bin?raw"

	const rawData = JSON.parse(decompressString(compressedDance))
	const { fps, frames: rawFrames }: { fps: number; frames: string[] } = rawData
	const decodedFrames = rawFrames.map((frame) => deserializeFrame(decompressFrame(frame)))

	let { scale = 1 } = $props()
</script>

<GridAnimation
	class="pointer-events-none max-h-full max-w-full select-none invert dark:invert-0"
	{fps}
	frames={decodedFrames}
	{scale}
/>
