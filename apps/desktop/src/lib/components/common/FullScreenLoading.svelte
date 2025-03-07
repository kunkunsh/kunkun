<script lang="ts">
	import { appState } from "@/stores"
	import { cn } from "@/utils"
	import { Button } from "@kksh/svelte5"
	import { Layouts, TauriLink } from "@kksh/ui"
	import { goto } from "$app/navigation"
	import BorderBeam from "$lib/components/animations/BorderBeam.svelte"
	import { LoaderCircleIcon } from "lucide-svelte"

	let { class: className }: { class?: string } = $props()

	function goHome() {
		appState.setFullScreenLoading(false)
		goto("/app")
	}
</script>

<Layouts.Center class={cn("flex h-screen flex-col items-center justify-center", className)}>
	<LoaderCircleIcon class="h-24 w-24 animate-spin" />
	<span class="font-mono">Loading</span>
	<Button onclick={goHome}>Go Home</Button>
	<BorderBeam size={150} duration={12} />
</Layouts.Center>
