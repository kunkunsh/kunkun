<script lang="ts">
	import { cn } from "@kksh/ui/utils"
	import type { HTMLAttributes } from "svelte/elements"

	const {
		class: className,
		color = "white",
		duration
	}: { class?: string; color?: string; duration?: number } = $props()
</script>

<div class={cn("h-0.5 w-full", className)}>
	<div class="relative h-full overflow-hidden">
		<div class="loading-bar h-full" style="--color: {color}; --width: 30em"></div>
	</div>
</div>

<style>
	.loading-bar::before {
		content: "";
		position: absolute;
		display: block;
		width: var(--width);
		height: 100%;
		background: linear-gradient(
			to right,
			transparent,
			var(--color) 40%,
			var(--color) 60%,
			transparent
		);
		opacity: 0.5;
		animation: moveLoadingBar 2s linear infinite;
	}
	@keyframes moveLoadingBar {
		0% {
			left: calc(var(--width) * -1 / 2);
		}
		50% {
			left: calc(100% - var(--width) / 2);
		}
		100% {
			left: calc(var(--width) * -1 / 2);
		}
	}
</style>
