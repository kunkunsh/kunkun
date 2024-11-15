<script setup lang="ts">
import { notification, toast, ui } from "@kksh/api/ui/iframe"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
	updateTheme,
	type ThemeConfig
} from "@kksh/vue"
import {
	CalendarIcon,
	EnvelopeClosedIcon,
	FaceIcon,
	GearIcon,
	PersonIcon,
	RocketIcon
} from "@radix-icons/vue"
import { onMounted, reactive, watch } from "vue"

const themeConfig = reactive<ThemeConfig>({
	theme: "neutral",
	radius: 0.5,
	lightMode: "auto"
})
watch(themeConfig, (newVal, oldVal) => {
	updateTheme(newVal)
})

onMounted(() => {
	ui.getTheme().then((theme) => {
		updateTheme(theme)
	})
	toast.info("Welcome to the Vue Template demo!")
	notification.sendNotification({
		title: "Vue Template",
		body: "Welcome to the Vue Template demo!"
	})
})
</script>

<template>
	<main class="h-screen">
		<Command class="w-full rounded-lg border shadow-md">
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem value="Calendar">
						<CalendarIcon class="mr-2 h-4 w-4" />
						<span>Calendar</span>
					</CommandItem>
					<CommandItem value="Search Emoji">
						<FaceIcon class="mr-2 h-4 w-4" />
						<span>Search Emoji</span>
					</CommandItem>
					<CommandItem value="Launch">
						<RocketIcon class="mr-2 h-4 w-4" />
						<span>Launch</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Settings">
					<CommandItem value="Profile">
						<PersonIcon class="mr-2 h-4 w-4" />
						<span>Profile</span>
						<CommandShortcut>⌘P</CommandShortcut>
					</CommandItem>
					<CommandItem value="Mail">
						<EnvelopeClosedIcon class="mr-2 h-4 w-4" />
						<span>Mail</span>
						<CommandShortcut>⌘B</CommandShortcut>
					</CommandItem>
					<CommandItem value="Settings">
						<GearIcon class="mr-2 h-4 w-4" />
						<span>Settings</span>
						<CommandShortcut>⌘S</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	</main>
</template>
