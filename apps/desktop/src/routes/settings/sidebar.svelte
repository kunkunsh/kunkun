<script lang="ts">
	import { goBack, goHome } from "@/utils/route"
	import Icon from "@iconify/svelte"
	import { Button, SideBar } from "@kksh/svelte5"
	import { ArrowLeftIcon } from "lucide-svelte"
	import Blocks from "lucide-svelte/icons/blocks"
	import Calendar from "lucide-svelte/icons/calendar"
	import Cog from "lucide-svelte/icons/cog"
	import Command from "lucide-svelte/icons/command"
	import FileCode2 from "lucide-svelte/icons/file-code-2"
	import House from "lucide-svelte/icons/house"
	import Inbox from "lucide-svelte/icons/inbox"
	import Info from "lucide-svelte/icons/info"
	import Route from "lucide-svelte/icons/route"
	import Search from "lucide-svelte/icons/search"
	import Settings from "lucide-svelte/icons/settings"
	import SquareTerminal from "lucide-svelte/icons/square-terminal"

	// Menu items.
	const items = [
		{
			title: "General",
			url: "/settings",
			icon: Cog
		},

		{
			title: "Developer",
			url: "/settings/developer",
			icon: SquareTerminal
		},
		{
			title: "Extensions",
			url: "/settings/extensions",
			icon: Blocks
		},
		{
			title: "Set Dev Extension",
			url: "/settings/set-dev-ext-path",
			icon: Route
		},
		{
			title: "Add Dev Extension",
			url: "/settings/add-dev-extension",
			icon: FileCode2
		},
		{
			title: "About",
			url: "/settings/about",
			icon: Info
		}
	]
</script>

<SideBar.Root>
	<SideBar.Header>
		<SideBar.Menu>
			<SideBar.MenuItem data-tauri-drag-region>
				<Button variant="outline" size="icon" class="z-50" onclick={goHome}>
					<ArrowLeftIcon class="h-4 w-4" />
				</Button>
			</SideBar.MenuItem>
		</SideBar.Menu>
	</SideBar.Header>
	<SideBar.Content>
		<SideBar.Group>
			<SideBar.GroupLabel data-tauri-drag-region>Settings</SideBar.GroupLabel>
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
