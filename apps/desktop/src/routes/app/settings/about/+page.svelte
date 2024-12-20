<script lang="ts">
	import { goHome } from "@/utils/route"
	import { checkUpdateAndInstall } from "@/utils/updater"
	import Icon from "@iconify/svelte"
	import { Button, Card, SideBar } from "@kksh/svelte5"
	import { Layouts, TauriLink } from "@kksh/ui"
	import { getVersion } from "@tauri-apps/api/app"
	import { onMount } from "svelte"

	let appVersion = ""
	onMount(async () => {
		appVersion = await getVersion()
	})
</script>

<Layouts.Center class="w-full grow -translate-y-10 overflow-hidden">
	<div class="">
		<div class="flex w-full items-center space-x-5">
			<img src="/favicon.png" class="w-44" alt="Logo" />
			<div class="flex flex-col space-y-1">
				<p class="text-3xl font-bold">KunKun Shell</p>
				<p class="text-xs">Version: {appVersion}</p>
				<p class="flex gap-1">
					<strong class="font-bold">Author: </strong>
					<a
						href="https://github.com/HuakunShen"
						target="_blank"
						rel="noreferrer"
						class="flex items-center gap-2 font-mono text-sm hover:text-blue-600 hover:underline hover:dark:text-blue-500"
					>
						@HuakunShen
						<Icon icon="mdi:github" class="h-5 w-5" />
					</a>
				</p>
				<a
					href="https://github.com/kunkunsh/kunkun"
					target="_blank"
					rel="noreferrer"
					class="flex items-center gap-2 font-mono text-sm hover:text-blue-600 hover:underline hover:dark:text-blue-500"
				>
					Source Code
					<Icon icon="mdi:github" class="h-5 w-5" />
				</a>
				<a
					href="https://github.com/kunkunsh/kunkunExtensions"
					target="_blank"
					rel="noreferrer"
					class="flex items-center gap-2 font-mono text-sm hover:text-blue-600 hover:underline hover:dark:text-blue-500"
				>
					Extensions Source Code
					<Icon icon="mdi:github" class="h-5 w-5" />
				</a>
				<Button onclick={checkUpdateAndInstall} size="sm" variant="secondary">
					Check for Updates
				</Button>
			</div>
		</div>
	</div>
</Layouts.Center>
