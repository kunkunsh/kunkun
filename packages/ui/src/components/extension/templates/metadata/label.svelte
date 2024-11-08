<script lang="ts">
	import type { IconType, List, ListSchema } from "@kksh/api/models"
	import { IconMultiplexer } from "../../../common"

	const {
		title,
		text,
		icon
	}: {
		title: string
		text?:
			| string
			| {
					text: string
					color: string
			  }
		icon?: {
			type: IconType
			value: string
		}
	} = $props()
</script>

<div class="flex justify-between gap-1 py-1">
	<span class="text-muted-foreground text-sm font-semibold">{title}</span>
	<span class="flex items-center gap-2">
		{#if icon}
			<IconMultiplexer {icon} class="h-4 w-4" />
		{/if}
		<span class="text-sm">{text}</span>
	</span>
</div>
