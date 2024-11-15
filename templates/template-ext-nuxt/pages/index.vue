<script setup lang="ts">
import { ui } from "@kksh/api/ui/iframe"
import {
	Button,
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
	updateTheme
} from "@kksh/vue"

onMounted(() => {
	ui.getTheme().then((theme) => {
		updateTheme(theme)
	})
})
</script>
<template>
	<main class="h-screen">
		<Command>
			<CommandInput placeholder="Type a command or search..." />
			<div class="grow">
				<CommandList class="h-full">
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						<CommandItem value="calendar"> Calendar </CommandItem>
						<CommandItem value="search-emoji"> Search Emoji </CommandItem>
						<CommandItem value="calculator"> Calculator </CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Settings">
						<CommandItem value="profile"> Profile </CommandItem>
						<CommandItem value="billing"> Billing </CommandItem>
						<CommandItem value="settings"> Settings </CommandItem>
					</CommandGroup>
				</CommandList>
			</div>
			<div class="h-10 border">
				<NuxtLink to="/about">
					<Button class="float-right">About Page</Button>
				</NuxtLink>
			</div>
		</Command>
	</main>
</template>
