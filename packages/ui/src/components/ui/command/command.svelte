<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { Command as CommandPrimitive } from "bits-ui"

	let {
		value = $bindable(""),
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.RootProps = $props()
</script>

<CommandPrimitive.Root
	class={cn(
		"bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
		className
	)}
	bind:ref
	bind:value
	{...restProps}
/>
