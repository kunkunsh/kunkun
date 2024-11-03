<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import { codeToHtml } from "shiki"
	import { onMount } from "svelte"

	const {
		code,
		lang,
		theme,
		class: className
	}: { code: string; lang: string; theme?: string; class?: string } = $props()
	let html = $state("")
	onMount(async () => {
		html = await codeToHtml(code, {
			lang: lang,
			theme: theme ?? "vitesse-dark"
		})
	})
</script>

<div class={cn("", className)}>
	{@html html}
</div>
