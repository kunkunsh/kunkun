<script lang="ts">
	import Icon from "@iconify/svelte"
	import { Button, ScrollArea } from "@kksh/svelte5"
	import { Error, Layouts, Shiki } from "@kksh/ui"
	import { type Snippet } from "svelte"

	const {
		title,
		message,
		class: className,
		rawJsonError,
		onnGoBack,
		footer
	}: {
		title: string
		message: string
		class?: string
		rawJsonError: string
		onnGoBack?: () => void
		footer?: Snippet
	} = $props()

	let enterDown = $state(false)

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			enterDown = true
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (event.key === "Enter") {
			enterDown = false
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<Error.General {title} {message} class={className}>
	<ScrollArea class="" orientation="both">
		<Shiki class="" code={rawJsonError} lang="json" />
	</ScrollArea>
	<br />
	{#snippet footer()}
		{#if footer}
			{@render footer()}
		{:else}
			<Button variant="default" class="w-full" onclick={onnGoBack} disabled={enterDown}>
				Go Back
				<Icon icon="mi:enter" />
			</Button>
		{/if}
	{/snippet}
</Error.General>
