<script lang="ts">
	import { cn } from "@kksh/ui/utils"
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

	function handleClick() {
		open(href)
	}
</script>

<button
	class={cn(
		"font-medium text-blue-600 hover:cursor-pointer hover:underline dark:text-blue-500 text-left",
		className
	)}
	onclick={handleClick}
>
	{@render children?.()}
</button>
