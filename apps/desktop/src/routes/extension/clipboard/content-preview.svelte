<script lang="ts">
	import { cn } from "@/utils"
	import { db } from "@kksh/api/commands"
	import type { ExtData } from "@kksh/api/models"
	import { Resizable, Separator } from "@kksh/svelte5"
	import { convertFileSrc } from "@tauri-apps/api/core"
	import DOMPurify from "dompurify"

	function formatDate(date: Date) {
		const now = new Date()
		const isToday = date.toDateString() === now.toDateString()

		const options: Intl.DateTimeFormatOptions = {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true
		} as const
		const timeString = date.toLocaleTimeString("en-US", options)

		if (isToday) {
			return `Today at ${timeString}`
		} else {
			const dateOptions: Intl.DateTimeFormatOptions = {
				month: "short",
				day: "numeric",
				year: "numeric"
			} as const
			const dateString = date.toLocaleDateString("en-US", dateOptions)
			return `${dateString} at ${timeString}`
		}
	}

	let { highlighted }: { highlighted: ExtData } = $props()
	let imgSrc = $state<string>("")
	let txtData = $state<string>("")
	let createTime = $state<Date>()
	let imgRef = $state<HTMLImageElement>()

	$effect(() => {
		;(async () => {
			if (highlighted.dataType === "Image") {
				const dbRecord = await db.getExtensionDataById(highlighted.dataId, []) // do not load "data" field
				imgSrc = await convertFileSrc(`/?id=${highlighted.dataId}`, "cbimg")
				createTime = dbRecord?.createdAt
			} else {
				const dbRecord = await db.getExtensionDataById(highlighted.dataId) // do not load "data" field
				txtData = dbRecord?.data || ""
				createTime = dbRecord?.createdAt
			}
		})()
	})
</script>

<Resizable.PaneGroup direction="vertical">
	<Resizable.Pane defaultSize={50} class="px-2 py-1">
		<!-- <div class="flex justify-center"> -->
		<img
			src={imgSrc}
			class={cn({
				hidden: highlighted.dataType !== "Image",
				"h-full": highlighted.dataType === "Image"
			})}
			alt=""
			bind:this={imgRef}
		/>

		{#if highlighted.dataType === "Image"}{:else if highlighted.dataType === "Text"}
			<div class="text-sm">{txtData}</div>
		{:else if highlighted.dataType === "Html"}
			<div class="">
				{@html DOMPurify.sanitize(txtData)}
			</div>
		{:else}
			<div class="text-sm">No preview available</div>
		{/if}
		<!-- </div> -->
	</Resizable.Pane>
	<Resizable.Handle withHandle />
	<Resizable.Pane defaultSize={50} class="space-y-1 px-4 pt-2">
		<h2 class="font-mono font-bold">Information</h2>
		{#if createTime}
			<Separator />
			{@render row("Copied At", formatDate(createTime))}
		{/if}
		<Separator />
		{@render row("Content Type", highlighted.dataType || "")}
		{#if highlighted.dataType === "Image"}
			{#if imgRef}
				<Separator />
				{@render row("Dimension", `${imgRef.naturalWidth}x${imgRef.naturalHeight}`)}
			{/if}
		{:else}
			<Separator />
			{@render row("Character Count", txtData.length.toString())}
			<Separator />
			{@render row("Word Count", txtData.split(/\s+/).length.toString())}
		{/if}
	</Resizable.Pane>
</Resizable.PaneGroup>
{#snippet row(label: string, value: string)}
	<div class="flex justify-between">
		<span class="text-sm font-semibold">{label}</span>
		<span class="text-sm">{value}</span>
	</div>
{/snippet}
