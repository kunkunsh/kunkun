<script lang="ts">
	import autoAnimate from "@formkit/auto-animate"
	import Icon from "@iconify/svelte"
	import { Button, ButtonModule, Collapsible, ScrollArea } from "@kksh/svelte5"
	import { Error, Layouts, Shiki } from "@kksh/ui"
	import { ChevronsUpDown } from "lucide-svelte"
	import { type Snippet } from "svelte"
	import { fade, slide } from "svelte/transition"

	const {
		title,
		message,
		class: className,
		rawJsonError,
		onGoBack,
		footer
	}: {
		title: string
		message: string
		class?: string
		rawJsonError: string
		onGoBack?: () => void
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
	<Collapsible.Root class="w-full space-y-2">
		<div class="flex items-center justify-between space-x-4 px-4">
			<h4 class="text-sm font-semibold">Raw Error JSON</h4>
			<Collapsible.Trigger
				class={ButtonModule.buttonVariants({ variant: "ghost", size: "sm", class: "w-9 p-0" })}
			>
				<ChevronsUpDown class="size-4" />
			</Collapsible.Trigger>
		</div>
		<Collapsible.Content class="space-y-2">
			<ScrollArea class="h-64" orientation="both">
				<Shiki class="" code={rawJsonError} lang="json" />
			</ScrollArea>
		</Collapsible.Content>
	</Collapsible.Root>
	<br />
	{#snippet footer()}
		{#if footer}
			{@render footer()}
		{:else}
			<Button variant="default" class="w-full" onclick={onGoBack} disabled={enterDown}>
				Go Back
				<Icon icon="mi:enter" />
			</Button>
		{/if}
	{/snippet}
</Error.General>
