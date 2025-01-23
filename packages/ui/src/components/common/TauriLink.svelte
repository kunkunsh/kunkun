<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { browser } from "$app/environment"
	import type { Snippet } from "svelte"
	import type { HTMLAttributes } from "svelte/elements"
	import { open } from "tauri-plugin-shellx-api"

	const {
		href,
		class: className = "",
		children
	}: {
		href: string
		class?: HTMLAttributes<HTMLAnchorElement>["class"]
		children: Snippet
	} = $props()

	// @ts-expect-error window.__TAURI_INTERNALS__ is not defined in the browser
	const isInTauri = browser ? !!window.__TAURI_INTERNALS__ : false
	function handleClick() {
		open(href)
	}
</script>

{#if isInTauri}
	<button
		class={cn(
			"text-left font-medium text-blue-600 hover:cursor-pointer hover:underline dark:text-blue-500",
			className
		)}
		onclick={handleClick}
	>
		{@render children?.()}
	</button>
{:else}
	<a
		{href}
		target="_blank"
		class={cn(
			"text-left font-medium text-blue-600 hover:cursor-pointer hover:underline dark:text-blue-500",
			className
		)}
	>
		{@render children?.()}
	</a>
{/if}
