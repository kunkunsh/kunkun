<!-- Element Plus Style Alert (created because the original Shadcn Alert is not very good looking) -->
<script lang="ts" module>
	export type AlertProps = {
		title: string
		closable?: boolean
		description: string
		type: "success" | "info" | "warning" | "error"
		theme: "light" | "dark"
		onClose?: () => void
		withIcon?: boolean
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
	import type { Component, ComponentType } from "svelte"
	import { fade } from "svelte/transition"
	import { cn } from "../../utils"

	let { title, description, type, theme, closable, withIcon, onClose }: AlertProps = $props()
	let show = $state(true)

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
</script>

{#if show}
	<div
		class={cn("flex items-center gap-3 rounded px-3 py-3", {
			"bg-red-500/10": type === "error",
			"bg-blue-500/10": type === "info",
			"bg-yellow-500/10": type === "warning",
			"bg-green-500/10": type === "success"
		})}
		transition:fade
	>
		{#if withIcon}
			{#if type === "success"}
				<CircleCheckBigIcon class="text-green-400" />
			{:else if type === "info"}
				<CircleHelpIcon class="text-blue-400" />
			{:else if type === "warning"}
				<CircleAlertIcon class="text-yellow-400" />
			{:else if type === "error"}
				<CircleXIcon class="text-red-400" />
			{/if}
		{/if}
		<div class="flex grow flex-col">
			<span
				class={cn({
					"text-green-400": type === "success",
					"text-blue-400": type === "info",
					"text-yellow-400": type === "warning",
					"text-red-400": type === "error"
				})}
			>
				{title}
			</span>
			<small
				class={cn({
					"text-green-400/90": type === "success",
					"text-blue-400/90": type === "info",
					"text-yellow-400/90": type === "warning",
					"text-red-400/90": type === "error"
				})}
			>
				{description}
			</small>
		</div>
		{#if closable}
			<XIcon
				onclick={() => {
					if (onClose) {
						onClose()
					} else {
					}
					show = false
				}}
				class="h-4 w-4 cursor-pointer self-start"
			/>
		{/if}
	</div>
{/if}
