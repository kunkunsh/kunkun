<script lang="ts">
	import DenoInstall from "@/components/standalone/help/deno-install.svelte"
	import { appConfig } from "@/stores/appConfig"
	import { Button } from "@kksh/svelte5"
	import { goto } from "$app/navigation"
	import { ArrowRightIcon } from "lucide-svelte"
	import { onMount } from "svelte"
	import { whereIsCommand } from "tauri-plugin-shellx-api"

	let step = $state(0)

	onMount(async () => {
		const denoPath = await whereIsCommand("deno")
		if (!denoPath) {
			step = 1
		}
	})

	function nextStep() {
		step++
	}

	$effect(() => {
		if (step === 2) {
			appConfig.setOnBoarded(true)
			goto("/app")
		}
	})
</script>

{#if step === 0}{:else if step === 1}
	<DenoInstall />
{/if}
<Button class="absolute bottom-4 right-4" variant="outline" size="icon" onclick={nextStep}>
	<ArrowRightIcon />
</Button>
