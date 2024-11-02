<script lang="ts">
	import { Command } from "@kksh/svelte5"
	import Calculator from "lucide-svelte/icons/calculator"
	import Calendar from "lucide-svelte/icons/calendar"
	import CreditCard from "lucide-svelte/icons/credit-card"
	import Settings from "lucide-svelte/icons/settings"
	import Smile from "lucide-svelte/icons/smile"
	import User from "lucide-svelte/icons/user"
</script>

<Command.Root class="max-w-[450px] rounded-lg border shadow-md">
	<Command.Input placeholder="Type a command or search..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Suggestions">
			<Command.Item>
				<span>Calendar</span>
			</Command.Item>
			<Command.Item>
				<span>Search Emoji</span>
			</Command.Item>
			<Command.Item>
				<span>Calculator</span>
			</Command.Item>
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Settings">
			<Command.Item>
				<span>Profile</span>
				<Command.Shortcut>⌘P</Command.Shortcut>
			</Command.Item>
			<Command.Item>
				<span>Billing</span>
				<Command.Shortcut>⌘B</Command.Shortcut>
			</Command.Item>
			<Command.Item>
				<span>Settings</span>
				<Command.Shortcut>⌘S</Command.Shortcut>
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Root>
