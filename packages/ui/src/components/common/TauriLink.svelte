<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { browser } from "$app/environment"
	import type { Snippet } from "svelte"
	import type { HTMLAttributes } from "svelte/elements"
	import { open } from "tauri-plugin-shellx-api"

	let {
		href,
		class: className = "",
		style,
		children,
		ref = $bindable(null)
	}: {
		href?: string
		style?: HTMLAttributes<HTMLAnchorElement>["style"]
		class?: HTMLAttributes<HTMLAnchorElement>["class"]
		children: Snippet
		ref?: HTMLAnchorElement | HTMLButtonElement | null
	} = $props()

	// @ts-expect-error window.__TAURI_INTERNALS__ is not defined in the browser
	const isInTauri = browser ? !!window.__TAURI_INTERNALS__ : false
	function handleClick() {
		if (href) {
			open(href)
		}
	}
</script>

{#if isInTauri}
	<button
		bind:this={ref}
		class={cn(
			"text-left font-medium text-blue-600 hover:cursor-pointer hover:underline dark:text-blue-500",
			className
		)}
		{style}
		onclick={handleClick}
	>
		{@render children?.()}
	</button>
{:else}
	<a
		bind:this={ref}
		{href}
		{style}
		target="_blank"
		class={cn(
			"text-left font-medium text-blue-600 hover:cursor-pointer hover:underline dark:text-blue-500",
			className
		)}
	>
		{@render children?.()}
	</a>
{/if}
