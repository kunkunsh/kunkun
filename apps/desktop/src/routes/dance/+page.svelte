<script lang="ts">
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { Button } from "@kksh/svelte5"
	import { Layouts } from "@kksh/ui"
	import Dance from "$lib/components/dance.svelte"
	import ArrowLeft from "svelte-radix/ArrowLeft.svelte"
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
	<Dance />
</Layouts.Center>
