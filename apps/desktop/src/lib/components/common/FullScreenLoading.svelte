<script lang="ts">
	import { appState } from "@/stores"
	import { cn } from "@/utils"
	import { Button } from "@kksh/svelte5"
	import { BorderBeam, Constants, Layouts, TauriLink } from "@kksh/ui"
	import { goto } from "$app/navigation"
	import { ArrowLeftIcon, LoaderCircleIcon } from "lucide-svelte"
	import Dance from "../dance/dance.svelte"

	let { class: className }: { class?: string } = $props()

	function goHome() {
		appState.setFullScreenLoading(false)
		goto("/app")
	}
</script>

<Layouts.Center class={cn("flex h-screen flex-col items-center justify-center", className)}>
	<Button
		variant="outline"
		size="icon"
		onclick={goHome}
		class={cn(Constants.CLASSNAMES.BACK_BUTTON, "absolute left-4 top-4")}
		data-flip-id={Constants.CLASSNAMES.BACK_BUTTON}
	>
		<ArrowLeftIcon class="size-4" />
	</Button>
	<Dance class="absolute z-50 h-screen opacity-20" />
	<LoaderCircleIcon class="h-24 w-24 animate-spin" />
	<span class="font-mono">Loading</span>
	<BorderBeam size={150} duration={12} />
</Layouts.Center>
