<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { Command as CommandPrimitive } from "bits-ui"

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.LinkItemProps = $props()
</script>

<CommandPrimitive.LinkItem
	class={cn(
		"aria-selected:bg-accent aria-selected:text-accent-foreground relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
		className
	)}
	bind:ref
	{...restProps}
/>
