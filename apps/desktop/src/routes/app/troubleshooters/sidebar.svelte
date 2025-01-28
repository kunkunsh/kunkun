<script lang="ts">
	import { i18n } from "@/i18n"
	import * as m from "@/paraglide/messages"
	import { goHome } from "@/utils/route"
	import { Button, Sidebar } from "@kksh/svelte5"
	import { Constants } from "@kksh/ui"
	import { ArrowLeftIcon } from "lucide-svelte"
	import AppWindow from "lucide-svelte/icons/app-window"
	import Loader from "lucide-svelte/icons/loader"
	import Network from "lucide-svelte/icons/network"

	let { class: className }: { class?: string } = $props()
	const items = [
		{
			title: m.troubleshooters_sidebar_extension_loading_title(),
			url: i18n.resolveRoute("/app/troubleshooters/extension-loading"),
			icon: Loader
		},
		{
			title: m.troubleshooters_sidebar_extension_window_title(),
			url: i18n.resolveRoute("/app/troubleshooters/extension-window"),
			icon: AppWindow
		},
		{
			title: m.troubleshooters_sidebar_mdns_debugger_title(),
			url: i18n.resolveRoute("/app/troubleshooters/mdns-debugger"),
			icon: Network
		}
	]
	let currentItem = $state(items.find((item) => window.location.pathname === item.url))
</script>

<Sidebar.Root class={className}>
	<Sidebar.Header class="h-12">
		<Sidebar.Menu>
			<Sidebar.MenuItem data-tauri-drag-region>
				<Button
					variant="outline"
					size="icon"
					class="z-50 {Constants.CLASSNAMES.BACK_BUTTON}"
					onclick={goHome}
				>
					<ArrowLeftIcon class="h-4 w-4" />
				</Button>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel data-tauri-drag-region>
				{m.troubleshooters_sidebar_title()}
			</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
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
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
