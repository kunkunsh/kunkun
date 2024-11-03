<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { type Snippet } from "svelte"

	const { children, class: className }: { children: Snippet; class?: string } = $props()
</script>

<div class={cn("flex items-center justify-center", className)}>
	{@render children?.()}
</div>
