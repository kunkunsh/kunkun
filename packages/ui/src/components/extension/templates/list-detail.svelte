<!-- <script setup lang="ts">
	import {
		List,
		ListSchema,
		MarkdownSchema,
		NodeNameEnum,
		WorkerExtension
	} from "@kksh/api/ui/worker"
	import Markdown from "./Markdown.vue"
	import Metadata from "./Metadata.vue"

	const props = defineProps<{
		detail: ListSchema.ItemDetail
	}>()
</script>

<template>
	<div v-for="child in detail.children" class="max-h-full overflow-y-auto">
		<Markdown
			v-if="child.nodeName === NodeNameEnum.Markdown"
			:markdown="(child as MarkdownSchema).content"
		/>
		<Metadata
			v-if="child.nodeName === NodeNameEnum.ListItemDetailMetadata"
			:items="(child as ListSchema.ItemDetailMetadata).items"
		/>
	</div>
</template> -->
