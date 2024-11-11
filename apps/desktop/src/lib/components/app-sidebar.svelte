<script lang="ts">
	import { SideBar } from "@kksh/svelte5"
	import Calendar from "lucide-svelte/icons/calendar"
	import House from "lucide-svelte/icons/house"
	import Inbox from "lucide-svelte/icons/inbox"
	import Search from "lucide-svelte/icons/search"
	import Settings from "lucide-svelte/icons/settings"

	// Menu items.
	const items = [
		{
			title: "Home",
			url: "#",
			icon: House
		},
		{
			title: "Inbox",
			url: "#",
			icon: Inbox
		},
		{
			title: "Calendar",
			url: "#",
			icon: Calendar
		},
		{
			title: "Search",
			url: "#",
			icon: Search
		},
		{
			title: "Settings",
			url: "#",
			icon: Settings
		}
	]
</script>

<SideBar.Root>
	<SideBar.Content>
		<SideBar.Group>
			<SideBar.GroupLabel>Application</SideBar.GroupLabel>
			<SideBar.GroupContent>
				<SideBar.Menu>
					{#each items as item (item.title)}
						<SideBar.MenuItem>
							<SideBar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</SideBar.MenuButton>
						</SideBar.MenuItem>
					{/each}
				</SideBar.Menu>
			</SideBar.GroupContent>
		</SideBar.Group>
	</SideBar.Content>
</SideBar.Root>
