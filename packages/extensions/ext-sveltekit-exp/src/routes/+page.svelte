<script lang="ts">
	import { base } from '$app/paths';
	import { clipboard, notification, ui, toast } from '@kksh/api/ui/iframe';
	import {
		ModeToggle,
		Button,
		Command,
		CommandFooter,
		ModeWatcher,
		Separator,
		ThemeWrapper,
		updateTheme
	} from '@kksh/svelte';
	import ThemeCustomizer from '$lib/components/ThemeCustomizer.svelte';
	import {
		Calculator,
		Calendar,
		CreditCard,
		Settings,
		SettingsIcon,
		Smile,
		User
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		ui.registerDragRegion();
		notification.sendNotification('Hello from template-ext-svelte');
		ui.getTheme().then((theme) => {
			updateTheme(theme);
		});
	});

	let highlighted = '';
	let searchTerm = '';
</script>

<ModeWatcher />

<ThemeWrapper>
	<Command.Root class="h-screen rounded-lg border shadow-md" bind:value={highlighted}>
		<Command.Input placeholder="Type a command or search..." autofocus bind:value={searchTerm} />
		<div class="grow">
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group heading="Suggestions">
					<Command.Item onSelect={(v) => console.log('selected:', v)}>
						<Calendar class="mr-2 h-4 w-4" />

						<span>Calendar</span>
					</Command.Item>
					<Command.Item onSelect={(v) => console.log('selected:', v)}>
						<Smile class="mr-2 h-4 w-4" />
						<span>Search Emoji</span>
					</Command.Item>
					<Command.Item onSelect={(v) => console.log('selected:', v)}>
						<Calculator class="mr-2 h-4 w-4" />
						<span>Calculator</span>
					</Command.Item>
				</Command.Group>
				<Command.Separator />
				<Command.Group heading="Settings">
					<Command.Item onSelect={(v) => console.log('selected:', v)}>
						<User class="mr-2 h-4 w-4" />
						<span>Profile</span>
						<Command.Shortcut>⌘P</Command.Shortcut>
					</Command.Item>
					<Command.Item value="billllling">
						<CreditCard class="mr-2 h-4 w-4" />
						<span>Billing</span>
						<Command.Shortcut>⌘B</Command.Shortcut>
					</Command.Item>
					<Command.Item onSelect={(v) => console.log('selected:', v)}>
						<Settings class="mr-2 h-4 w-4" />
						<span>Settings</span>
						<Command.Shortcut>⌘S</Command.Shortcut>
					</Command.Item>
				</Command.Group>
			</Command.List>
		</div>
		<CommandFooter>
			<SettingsIcon class="ml-2 h-4 w-4" />
			<div class="flex items-center space-x-2">
				<Button variant="ghost" size="sm">
					Open Application
					<kbd class="ml-1">↵</kbd>
				</Button>
				<Separator orientation="vertical" />
				<a href="{base}/about"><Button>About Page</Button></a>
				<Button
					on:click={async () => {
						toast.success(await clipboard.readText());
					}}
				>
					Read Clipboard
				</Button>
				<ModeToggle />
				<ThemeCustomizer />
			</div>
		</CommandFooter>
	</Command.Root>
</ThemeWrapper>
