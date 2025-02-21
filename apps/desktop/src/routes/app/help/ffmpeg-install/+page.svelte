<script lang="ts">
	import FFmpegInstall from "@/components/standalone/help/ffmpeg-install.svelte"
	import { goHomeOnEscape } from "@/utils/key"
	import { goHome } from "@/utils/route"
	import { Button } from "@kksh/svelte5"
	import ArrowLeft from "svelte-radix/ArrowLeft.svelte"
</script>

<svelte:window on:keydown={goHomeOnEscape} />
<Button variant="outline" size="icon" onclick={goHome} class="absolute left-2 top-2">
	<ArrowLeft class="size-4" />
</Button>
<main class="container pt-12">
	<FFmpegInstall />
</main>
