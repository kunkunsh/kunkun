<script lang="ts">
	import { Button } from "@kksh/svelte5"
	import { CopyIcon } from "lucide-svelte"
	import type { Snippet } from "svelte"
	import TauriLink from "../common/TauriLink.svelte"

	let a: HTMLAnchorElement | HTMLButtonElement | null = $state(null)

	let {
		children,
		class: className,
		href,
		style,
		...rest
	}: { children: Snippet; href?: string; class?: string; style?: string } = $props()
</script>

<TauriLink {href} class={className} {style} bind:ref={a}>{@render children()}</TauriLink>
