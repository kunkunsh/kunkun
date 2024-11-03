<script lang="ts">
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { Button } from "@kksh/svelte5"
	import { GridAnimation, Layouts } from "@kksh/ui"
	import { decompressFrame, decompressString, deserializeFrame } from "@kksh/utils"
	import compressedDance from "$lib/../data/dance.bin?raw"
	import ArrowLeft from "svelte-radix/ArrowLeft.svelte"

	const rawData = JSON.parse(decompressString(compressedDance))
	const { fps, frames: rawFrames }: { fps: number; frames: string[] } = rawData
	const decodedFrames = rawFrames.map((frame) => deserializeFrame(decompressFrame(frame)))
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button
	variant="outline"
	size="icon"
	onclick={goBack}
	class="absolute left-2 top-2"
	data-tauri-drag-region
>
	<ArrowLeft class="size-4" />
</Button>
<Layouts.Center class="h-screen w-screen" data-tauri-drag-region>
	<GridAnimation
		class="pointer-events-none max-h-full max-w-full invert dark:invert-0"
		{fps}
		frames={decodedFrames}
		scale={1}
	/>
</Layouts.Center>
