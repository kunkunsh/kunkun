<!-- Element Plus Style Alert (created because the original Shadcn Alert is not very good looking) -->
<script lang="ts" module>
	export type AlertProps = {
		title?: string
		closable?: boolean
		description?: string
		variant?: "success" | "info" | "warning" | "error"
		onClose?: () => void
		class?: string
		withIcon?: boolean
		children?: Snippet
	}
</script>

<script lang="ts">
	import {
		CircleAlertIcon,
		CircleCheckBigIcon,
		CircleHelpIcon,
		CircleXIcon,
		XIcon
	} from "lucide-svelte"
	import type { Snippet } from "svelte"
	import { fade } from "svelte/transition"
	import { cn } from "../../utils"

	const config: Record<
		"success" | "info" | "warning" | "error",
		{
			color: string
		}
	> = {
		success: {
			color: "green"
		},
		info: {
			color: "blue"
		},
		warning: {
			color: "yellow"
		},
		error: {
			color: "red"
		}
	}

	let {
		title,
		description,
		class: className,
		variant: type = "info",
		closable,
		withIcon,
		onClose,
		children
	}: AlertProps = $props()
	let show = $state(true)
</script>

{#if show}
	<div
		class={cn("flex items-center gap-3 rounded-xl px-3 py-3", className, {
			"bg-red-500/10": type === "error",
			"bg-blue-500/10": type === "info",
			"bg-yellow-500/10": type === "warning",
			"bg-green-500/10": type === "success"
		})}
		transition:fade
	>
		{#if withIcon}
			{#if type === "success"}
				<CircleCheckBigIcon class="h-6 w-6 shrink-0 text-green-400" />
			{:else if type === "info"}
				<CircleHelpIcon class="h-6 w-6 shrink-0 text-blue-400" />
			{:else if type === "warning"}
				<CircleAlertIcon class="h-6 w-6 shrink-0 text-yellow-400" />
			{:else if type === "error"}
				<CircleXIcon class="h-6 w-6 shrink-0 text-red-400" />
			{/if}
		{/if}
		<div class="flex grow flex-col">
			{#if title}
				<span
					class={cn("font-semibold", {
						"text-green-400": type === "success",
						"text-blue-400": type === "info",
						"text-yellow-400": type === "warning",
						"text-red-400": type === "error"
					})}
				>
					{title}
				</span>
			{/if}
			{#if description}
				<small
					class={cn("text-sm", {
						"text-green-400/90": type === "success",
						"text-blue-400/90": type === "info",
						"text-yellow-400/90": type === "warning",
						"text-red-400/90": type === "error"
					})}
				>
					{description}
				</small>
			{/if}
			{#if children}
				{@render children()}
			{/if}
		</div>
		{#if closable}
			<XIcon
				onclick={() => {
					if (onClose) {
						onClose()
					}
					show = false
				}}
				class="h-4 w-4 shrink-0 cursor-pointer self-start"
			/>
		{/if}
	</div>
{/if}
