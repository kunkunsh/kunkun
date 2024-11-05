<script lang="ts">
	import DevExtPathForm from "@/components/standalone/settings/DevExtPathForm.svelte"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { Button } from "@kksh/svelte5"
	import { ArrowLeftIcon } from "lucide-svelte"
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" class="absolute left-2 top-2 z-50" onclick={goBack}>
	<ArrowLeftIcon class="h-4 w-4" />
</Button>
<div class="absolute left-0 top-0 h-10 w-screen" data-tauri-drag-region></div>
<main class="container pt-10">
	<h2 class="text-2xl font-bold">Set Dev Extension Path</h2>
	<p>This is where your extensions will be installed.</p>
	<DevExtPathForm />
</main>
