<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import type { WithoutChild } from "bits-ui"
	import * as FormPrimitive from "formsnap"

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChild<FormPrimitive.LegendProps> = $props()
</script>

<FormPrimitive.Legend
	bind:ref
	{...restProps}
	class={cn("data-[fs-error]:text-destructive text-sm font-medium leading-none", className)}
/>
