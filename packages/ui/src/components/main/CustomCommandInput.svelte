<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { Command as CommandPrimitive } from "bits-ui"
	import { type Snippet } from "svelte"

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		leftSlot,
		rightSlot,
		...restProps
	}: CommandPrimitive.InputProps & {
		leftSlot?: Snippet
		rightSlot?: Snippet
	} = $props()
</script>

<div class="flex items-center gap-2 border-b px-3 py-1" data-command-input-wrapper="">
	{@render leftSlot?.()}
	<CommandPrimitive.Input
		class={cn(
			"placeholder:text-muted-foreground flex h-10 w-full select-none rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
			className
		)}
		bind:ref
		bind:value
		{...restProps}
	/>
	{@render rightSlot?.()}
</div>
