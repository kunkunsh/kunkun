<script lang="ts">
	import type { Color, ListSchema } from "@kksh/api/ui/worker"
	import { Badge } from "@kksh/svelte5"

	const {
		text,
		color
	}: {
		text?: string
		color?: Color
		// icon?: Icon
	} = $props()
</script>

<Badge
	style={`style: ${color ? color : "var(--muted-foreground)"}; background-color: ${color ? `${color}30` : "var(--muted)"};`}
>
	{text}
</Badge>
