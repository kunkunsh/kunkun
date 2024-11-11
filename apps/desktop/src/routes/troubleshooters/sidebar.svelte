<script lang="ts">
	import { goHome } from "@/utils/route"
	import { Button, SideBar } from "@kksh/svelte5"
	import { Constants } from "@kksh/ui"
	import { ArrowLeftIcon } from "lucide-svelte"
	import AppWindow from "lucide-svelte/icons/app-window"
	import Loader from "lucide-svelte/icons/loader"
	import Network from "lucide-svelte/icons/network"

	// Menu items.
	const items = [
		{
			title: "Extension Loading",
			url: "/troubleshooters/extension-loading",
			icon: Loader
		},
		{
			title: "Extension Window",
			url: "/troubleshooters/extension-window",
			icon: AppWindow
		},
		{
			title: "MDNS Debugger",
			url: "/troubleshooters/mdns-debugger",
			icon: Network
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
					class="z-50 {Constants.CLASSNAMES.BACK_BUTTON}"
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
