<script lang="ts">
	import { ListSchema } from "@kunkunapi/src/models"

	let { listViewContent }: { listViewContent: ListSchema.List } = $props()
	let detailWidth = $derived(listViewContent.detail ? (listViewContent.detail?.width ?? 70) : 0)
</script>

<div>detailWidth: {detailWidth}</div>
