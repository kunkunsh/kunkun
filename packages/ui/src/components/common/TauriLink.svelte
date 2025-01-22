<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import type { Snippet } from "svelte"
	import type { HTMLAttributes } from "svelte/elements"
	import { open } from "tauri-plugin-shellx-api"
	import { browser } from '$app/environment';

	const {
		href,
		class: className = "",
		children
	}: {
		href: string
		class?: HTMLAttributes<HTMLAnchorElement>["class"]
		children: Snippet
	} = $props()

	// @ts-ignore
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
	<a href={href} target="_blank" class={cn(
		"text-left font-medium text-blue-600 hover:cursor-pointer hover:underline dark:text-blue-500",
		className
	)}>
		{@render children?.()}
	</a>
{/if}
