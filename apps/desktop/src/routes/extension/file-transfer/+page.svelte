<script lang="ts">
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { Button } from "@kksh/svelte5"
	import { ArrowLeftIcon } from "lucide-svelte"
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" class="fixed left-2 top-2 z-50" onclick={goBack}>
	<ArrowLeftIcon class="h-4 w-4" />
</Button>
<div class="h-12" data-tauri-drag-region></div>
