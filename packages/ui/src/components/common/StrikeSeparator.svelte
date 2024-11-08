<script lang="ts">
	import { Separator } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import { type Snippet } from "svelte"

	const { class: className, children }: { class?: string; children: Snippet } = $props()
</script>

<div
	class={cn(
		"flex cursor-default select-none items-center justify-center space-x-5 whitespace-nowrap",
		className
	)}
>
	<span class="w-full">
		<Separator />
	</span>
	{@render children()}
	<span class="w-full">
		<Separator />
	</span>
</div>
