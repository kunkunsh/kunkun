<script lang="ts">
	import { IconEnum, type AppInfo } from "@kksh/api/models"
	import { Command } from "@kksh/svelte5"
	import { IconMultiplexer } from "@kksh/ui"
	import { DraggableCommandGroup } from "@kksh/ui/custom"
	import { convertFileSrc } from "@tauri-apps/api/core"
	import * as os from "@tauri-apps/plugin-os"
	import { toast } from "svelte-sonner"
	import { executeBashScript, open } from "tauri-plugin-shellx-api"

	const platform = os.platform()
	let { apps }: { apps: AppInfo[] } = $props()
</script>

<DraggableCommandGroup heading="Apps">
	{#each apps.filter(app => app.name) as app}
		<Command.Item
			class="flex justify-between"
			onSelect={() => {
				if (platform === "windows") {
					if (app.app_path_exe) {
						open(app.app_path_exe)
					} else {
						toast.error("No executable path found for this app")
					}
				} else if (platform === "macos") {
					open(app.app_desktop_path)
				} else if (platform === "linux") {
					if (app.app_path_exe) {
						executeBashScript(app.app_path_exe)
					} else {
						toast.error("No executable path found for this app")
					}
				} else {
					toast.error("Unsupported platform")
				}
			}}
			value={app.name}
		>
			<span class="flex gap-2">
				<IconMultiplexer
					icon={app.icon_path
						? {
								type: IconEnum.RemoteUrl,
								value: convertFileSrc(app.icon_path, "appicon")
							}
						: {
								type: IconEnum.Iconify,
								value: "mdi:application"
							}}
					class="!h-5 !w-5 shrink-0"
				/>
				<span>{app.name}</span>
			</span>
		</Command.Item>
	{/each}
</DraggableCommandGroup>
