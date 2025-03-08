<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { type Snippet } from "svelte"
	import { fade } from "svelte/transition"

	const {
		children,
		class: className,
		...restProps
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	}: { children: Snippet; class?: string; [key: string]: any } = $props()
</script>

<div transition:fade class={cn("flex items-center justify-center", className)} {...restProps}>
	{@render children?.()}
</div>
