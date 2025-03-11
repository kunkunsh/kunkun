<script lang="ts">
	import { ScrollArea as ScrollAreaPrimitive, type WithoutChild } from "bits-ui"
	import { cn } from "../../../utils"
	import { Scrollbar } from "./index.js"

	let {
		ref = $bindable(null),
		viewportRef = $bindable(null),
		class: className,
		orientation = "vertical",
		scrollbarXClasses = "",
		scrollbarYClasses = "",
		children,
		...restProps
	}: WithoutChild<ScrollAreaPrimitive.RootProps> & {
		viewportRef?: HTMLDivElement | null
		orientation?: "vertical" | "horizontal" | "both" | undefined
		scrollbarXClasses?: string | undefined
		scrollbarYClasses?: string | undefined
	} = $props()
</script>

<ScrollAreaPrimitive.Root bind:ref {...restProps} class={cn("relative overflow-hidden", className)}>
	<ScrollAreaPrimitive.Viewport bind:ref={viewportRef} class="h-full w-full rounded-[inherit]">
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>
	{#if orientation === "vertical" || orientation === "both"}
		<Scrollbar orientation="vertical" class={scrollbarYClasses} />
	{/if}
	{#if orientation === "horizontal" || orientation === "both"}
		<Scrollbar orientation="horizontal" class={scrollbarXClasses} />
	{/if}
	<ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>
