<script lang="ts">
	import { goHome } from "@/utils/route"
	import { checkUpdateAndInstall } from "@/utils/updater"
	import Icon from "@iconify/svelte"
	import { Button, Card, SideBar } from "@kksh/svelte5"
	import { Layouts, TauriLink } from "@kksh/ui"
	import { cn } from "@kksh/ui/utils"
	import { getVersion } from "@tauri-apps/api/app"
	import { ArrowLeftIcon } from "lucide-svelte"
	import GitHub from "lucide-svelte/icons/github"
	import { onMount } from "svelte"

	let appVersion = ""
	onMount(async () => {
		appVersion = await getVersion()
	})

	export let className: string | undefined = undefined

	const { useSidebar } = SideBar
	const sidebar = useSidebar()
</script>

{#if sidebar.state === "collapsed"}
	<Button variant="outline" size="icon" class="left-2 top-2 z-50 mt-2" onclick={goHome}>
		<ArrowLeftIcon class="h-4 w-4" />
	</Button>
{/if}
<Layouts.Center class="absolute top-0 h-screen w-screen">
	<Card.Root class={cn("flex h-full items-center justify-center border-none", className)}>
		<Card.Content class="flex w-full items-center space-x-5">
			<img src="/favicon.png" class="w-44" alt="Logo" />
			<div class="flex flex-col space-y-1">
				<p class="text-3xl font-bold">KunKun Shell</p>
				<p class="text-xs">Version: {appVersion}</p>
				<p>
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
		</Card.Content>
	</Card.Root>
</Layouts.Center>
