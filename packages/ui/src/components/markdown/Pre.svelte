<script lang="ts">
	import { Button } from "@kksh/svelte5"
	import { CopyIcon } from "lucide-svelte"
	import type { Snippet } from "svelte"

	let pre: HTMLPreElement

	let {
		children,
		class: className,
		style
	}: { children: Snippet; class?: string; style?: string } = $props()
</script>

<div class="relative">
	<pre class={className} {style} bind:this={pre}>{@render children()}</pre>
	<Button
		size="icon"
		variant="outline"
		onclick={() => navigator.clipboard.writeText(pre.textContent ?? "")}
		class="absolute right-2 top-2"
	>
		<CopyIcon />
	</Button>
</div>
