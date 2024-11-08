<script lang="ts">
	import { DateFormatter, getLocalTimeZone, today, type DateValue } from "@internationalized/date"
	import { Button, ButtonModule, Calendar, Popover, Select } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import CalendarIcon from "lucide-svelte/icons/calendar"

	const df = new DateFormatter("en-US", {
		dateStyle: "long"
	})

	let {
		date = $bindable(),
		class: className,
		value = $bindable()
	}: { date?: DateValue; class?: string; value?: string } = $props()
	const valueString = $derived(date ? df.format(date.toDate(getLocalTimeZone())) : "")
	$effect(() => {
		value = date ? date.toString() : ""
	})
	const items = [
		{ value: 0, label: "Today" },
		{ value: 1, label: "Tomorrow" },
		{ value: 3, label: "In 3 days" },
		{ value: 7, label: "In a week" }
	]
</script>

<Popover.Root>
	<Popover.Trigger
		class={cn(
			ButtonModule.buttonVariants({
				variant: "outline",
				class: "w-[280px] justify-start text-left font-normal"
			}),
			!date && "text-muted-foreground",
			className
		)}
	>
		<CalendarIcon class="mr-2 size-4" />
		{date ? df.format(date.toDate(getLocalTimeZone())) : "Pick a date"}
	</Popover.Trigger>
	<Popover.Content class="flex w-auto flex-col space-y-2 p-2">
		<Select.Root
			type="single"
			value={valueString}
			controlledValue
			onValueChange={(v) => {
				if (!v) return
				date = today(getLocalTimeZone()).add({ days: Number.parseInt(v) })
			}}
		>
			<Select.Trigger>
				{valueString}
			</Select.Trigger>
			<Select.Content>
				{#each items as item}
					<Select.Item value={`${item.value}`}>{item.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<div class="rounded-md border">
			<Calendar.Calendar type="single" bind:value={date} />
		</div>
	</Popover.Content>
</Popover.Root>
