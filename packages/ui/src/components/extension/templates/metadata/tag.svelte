<script lang="ts">
	import type { Color, ListSchema } from "@kksh/api/models"
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
	style={`style: ${color ? color : "var(--muted-foreground)"}; background-color: ${color ? `${color}` : "var(--muted)"};`}
>
	{text}
</Badge>
