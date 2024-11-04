<script lang="ts">
	import { Layouts } from "@kksh/ui"
	import { cn } from "@kksh/ui/utils"
	import { onMount } from "svelte"
	import { fade } from "svelte/transition"
	import Dance from "./dance.svelte"

	let {
		duration = 400,
		class: className,
		delay = 0,
		show = $bindable(true),
		autoHide = true
	}: {
		duration?: number
		class?: string
		delay?: number
		show?: boolean
		autoHide?: boolean
	} = $props()
	onMount(() => {
		setTimeout(() => {
			if (autoHide) show = false
		}, delay ?? 0)
	})
</script>

{#if show}
	<div out:fade={{ duration, delay }}>
		<Layouts.Center class={cn("bg-background absolute h-screen w-screen", className)} hidden={true}>
			<Dance />
		</Layouts.Center>
	</div>
{/if}
