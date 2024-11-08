<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import type { WithoutChild } from "bits-ui"
	import * as FormPrimitive from "formsnap"

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChild<FormPrimitive.DescriptionProps> = $props()
</script>

<FormPrimitive.Description
	bind:ref
	class={cn("text-muted-foreground text-[0.8rem]", className)}
	{...restProps}
/>
