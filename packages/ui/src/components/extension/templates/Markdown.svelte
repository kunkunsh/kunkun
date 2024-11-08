<script lang="ts">
	import SvelteMarkdown from "svelte-markdown"

	const { markdown }: { markdown: string } = $props()
</script>

<SvelteMarkdown source={markdown} />
