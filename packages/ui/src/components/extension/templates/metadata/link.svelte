<script lang="ts">
	import Icon from "@iconify/svelte"
	import TauriLink from "../../../common/TauriLink.svelte"

	const {
		text,
		title,
		url
	}: {
		text: string
		title: string
		url: string
	} = $props()
</script>

<div class="flex justify-between gap-1 py-1">
	<span class="text-muted-foreground text-sm font-semibold">{title}</span>
	<TauriLink href={url} class="flex items-center justify-center gap-1">
		<span class="text-sm">{text}</span>
		<Icon icon="gridicons:external" />
	</TauriLink>
</div>
