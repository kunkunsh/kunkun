<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { Command as CommandPrimitive } from "bits-ui"

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.ListProps = $props()
</script>

<CommandPrimitive.List
	class={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
	bind:ref
	{...restProps}
/>
