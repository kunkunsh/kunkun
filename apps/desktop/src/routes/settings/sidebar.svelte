<script lang="ts">
	import { goHome } from "@/utils/route"
	import { Button, SideBar } from "@kksh/svelte5"
	import { Constants } from "@kksh/ui"
	import { ArrowLeftIcon } from "lucide-svelte"
	import Blocks from "lucide-svelte/icons/blocks"
	import Cog from "lucide-svelte/icons/cog"
	import FileCode2 from "lucide-svelte/icons/file-code-2"
	import Info from "lucide-svelte/icons/info"
	import Route from "lucide-svelte/icons/route"
	import SquareTerminal from "lucide-svelte/icons/square-terminal"
	import { onMount } from "svelte"

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
	let currentItem = $state(items.find((item) => window.location.pathname === item.url))
</script>

<SideBar.Root>
	<SideBar.Header class="h-12">
		<SideBar.Menu>
			<SideBar.MenuItem data-tauri-drag-region>
				<Button
					variant="outline"
					size="icon"
					class={Constants.CLASSNAMES.BACK_BUTTON}
					onclick={goHome}
				>
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
							<SideBar.MenuButton
								isActive={currentItem?.url === item.url}
								onclick={() => {
									currentItem = item
								}}
							>
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
