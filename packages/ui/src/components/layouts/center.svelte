<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { type Snippet } from "svelte"

	const {
		children,
		class: className,
		...restProps
	}: { children: Snippet; class?: string; [key: string]: any } = $props()
</script>

<div class={cn("flex items-center justify-center", className)} {...restProps}>
	{@render children?.()}
</div>
