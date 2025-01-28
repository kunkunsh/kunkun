<script lang="ts">
	import { i18n } from "@/i18n"
	import * as m from "@/paraglide/messages"
	import { goHome } from "@/utils/route"
	import { Button, Sidebar } from "@kksh/svelte5"
	import { Constants } from "@kksh/ui"
	import { ArrowLeftIcon } from "lucide-svelte"
	import Blocks from "lucide-svelte/icons/blocks"
	import Cog from "lucide-svelte/icons/cog"
	import FileCode2 from "lucide-svelte/icons/file-code-2"
	import Info from "lucide-svelte/icons/info"
	import Route from "lucide-svelte/icons/route"
	import SquareTerminal from "lucide-svelte/icons/square-terminal"

	const items = [
		{
			title: m.settings_menu_general(),
			url: i18n.resolveRoute("/app/settings"),
			icon: Cog
		},
		{
			title: m.settings_menu_developer(),
			url: i18n.resolveRoute("/app/settings/developer"),
			icon: SquareTerminal
		},
		{
			title: m.settings_menu_extensions(),
			url: i18n.resolveRoute("/app/settings/extensions"),
			icon: Blocks
		},
		{
			title: m.settings_menu_set_dev_ext(),
			url: i18n.resolveRoute("/app/settings/set-dev-ext-path"),
			icon: Route
		},
		{
			title: m.settings_menu_add_dev_ext(),
			url: i18n.resolveRoute("/app/settings/add-dev-extension"),
			icon: FileCode2
		},
		{
			title: m.settings_menu_about(),
			url: i18n.resolveRoute("/app/settings/about"),
			icon: Info
		}
	]
	let currentItem = $state(items.find((item) => window.location.pathname === item.url))
</script>

<Sidebar.Root>
	<Sidebar.Header class="h-12">
		<Sidebar.Menu>
			<Sidebar.MenuItem data-tauri-drag-region>
				<Button
					variant="outline"
					size="icon"
					class={Constants.CLASSNAMES.BACK_BUTTON}
					onclick={goHome}
				>
					<ArrowLeftIcon class="h-4 w-4" />
				</Button>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel data-tauri-drag-region>{m.settings_menu_settings()}</Sidebar.GroupLabel>
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
