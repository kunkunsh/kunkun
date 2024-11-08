<script lang="ts">
	import { DateFormatter, getLocalTimeZone, type DateValue } from "@internationalized/date"
	import { ButtonModule, Calendar, Popover } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import CalendarIcon from "lucide-svelte/icons/calendar"

	const df = new DateFormatter("en-US", {
		dateStyle: "long"
	})
	let {
		date = $bindable(),
		value = $bindable(),
		class: className
	}: { date?: DateValue; value?: string; class?: string } = $props()
	let contentRef = $state<HTMLElement | null>(null)
	$effect(() => {
		value = date ? date.toString() : ""
	})
</script>

<Popover.Root>
	<Popover.Trigger
		class={cn(
			ButtonModule.buttonVariants({
				variant: "outline",
				class: cn("w-[280px] justify-start text-left font-normal", className)
			}),
			!date && "text-muted-foreground"
		)}
	>
		<CalendarIcon class="mr-2 size-4" />
		{date ? df.format(date.toDate(getLocalTimeZone())) : "Pick a date"}
	</Popover.Trigger>
	<Popover.Content bind:ref={contentRef} class="w-auto p-0">
		<Calendar.Calendar type="single" bind:value={date} />
	</Popover.Content>
</Popover.Root>
