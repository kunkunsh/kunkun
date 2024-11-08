<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import type { Snippet } from "svelte"

	let { class: className, children }: { class?: string; children: Snippet } = $props()
</script>

<kbd
	class={cn(
		"text-md bg-muted flex h-5 w-5 min-w-5 items-center justify-center rounded-sm border p-1 font-mono",
		className
	)}
>
	{@render children()}
</kbd>
