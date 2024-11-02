<script lang="ts">
	import { Card } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/src/utils"
	import { type Snippet } from "svelte"

	const {
		title,
		message,
		children,
		footer,
		class: className,
		footerClass
	}: {
		title: string
		message: string
		children?: Snippet
		footer?: Snippet
		class?: string
		footerClass?: string
	} = $props()
</script>

<Card.Root class={cn("w-[25em]", className)}>
	<Card.Header>
		<Card.Title class="text-xl font-semibold">{title}</Card.Title>
		<Card.Description>{message}</Card.Description>
	</Card.Header>
	<Card.Content>
		{@render children?.()}
	</Card.Content>
	<Card.Footer class={footerClass}>
		{@render footer?.()}
	</Card.Footer>
</Card.Root>
