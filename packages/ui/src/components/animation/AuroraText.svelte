<script lang="ts">
	import type { Snippet } from "svelte"
	import { cn } from "../../utils"

	let { class: className, children }: { class?: string; children: Snippet } = $props()
</script>

<span class={cn("relative inline-flex overflow-hidden", className)}>
	{@render children()}
	<span class="pointer-events-none absolute inset-0 mix-blend-lighten dark:mix-blend-darken">
		<span
			class="pointer-events-none absolute -top-1/2 h-[30vw] w-[30vw] animate-[aurora-border_6s_ease-in-out_infinite,aurora-1_12s_ease-in-out_infinite_alternate] bg-[hsl(var(--color-1))] mix-blend-overlay blur-[1rem]"
		></span>
		<span
			class="pointer-events-none absolute right-0 top-0 h-[30vw] w-[30vw] animate-[aurora-border_6s_ease-in-out_infinite,aurora-2_12s_ease-in-out_infinite_alternate] bg-[hsl(var(--color-2))] mix-blend-overlay blur-[1rem]"
		></span>
		<span
			class="pointer-events-none absolute bottom-0 left-0 h-[30vw] w-[30vw] animate-[aurora-border_6s_ease-in-out_infinite,aurora-3_12s_ease-in-out_infinite_alternate] bg-[hsl(var(--color-3))] mix-blend-overlay blur-[1rem]"
		></span>
		<span
			class="pointer-events-none absolute -bottom-1/2 right-0 h-[30vw] w-[30vw] animate-[aurora-border_6s_ease-in-out_infinite,aurora-4_12s_ease-in-out_infinite_alternate] bg-[hsl(var(--color-4))] mix-blend-overlay blur-[1rem]"
		></span>
	</span>
</span>
