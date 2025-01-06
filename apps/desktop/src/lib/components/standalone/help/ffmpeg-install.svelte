<script lang="ts">
	import InstallCodeBlock from "@/components/common/install-code-block.svelte"
	import Icon from "@iconify/svelte"
	import { IconEnum } from "@kksh/api/models"
	import { Button, Tabs } from "@kksh/svelte5"
	import { TauriLink } from "@kksh/ui"
	import { platform } from "@tauri-apps/plugin-os"
	import { onMount } from "svelte"
	import { toast } from "svelte-sonner"
	import { whereIsCommand } from "tauri-plugin-shellx-api"

	let brewPath = $state("")
	let chocoPath = $state("")
	let ffmpegPath = $state("")
	let aptPath = $state("")
	let _platform = $state(platform())

	onMount(async () => {
		;[ffmpegPath, brewPath, chocoPath, aptPath] = await Promise.all([
			whereIsCommand("ffmpeg"),
			whereIsCommand("brew"),
			whereIsCommand("choco"),
			whereIsCommand("apt")
		])
	})

	function onInstallSuccess() {}
	let alreadyInstalled = $derived(ffmpegPath != "")

	let command = {
		macos: "brew install ffmpeg",
		windows: "choco install ffmpeg",
		linux: `sudo apt update && sudo apt upgrade && sudo apt install ffmpeg`
	}
</script>

<h1 class="text-2xl font-bold font-mono">Install ffmpeg</h1>
<p class="font-mono text-sm">
	Some extensions require ffmpeg to enable advanced features. ffmpeg is optional but recommended.
</p>
<p class="font-mono text-sm">
	For example, the YouTube video downloader extension requires `ffmpeg` to merge audio and video;
	`ffmpeg` is also used in video processing extensions.
</p>
{#if alreadyInstalled}
	<div class="flex items-center gap-2 font-mono text-sm">
		<span>✅</span>
		<span>ffmpeg is already installed at </span>
		<pre class="text-sm">{ffmpegPath}</pre>
	</div>
{:else}
	<div class="flex items-center gap-2 font-mono text-sm">
		<span>❌</span>
		<span>ffmpeg is not installed</span>
	</div>
{/if}
<TauriLink
	href="/app/help/ffmpeg-install"
	icon={IconEnum.Iconify}
	iconValue="logos:ffmpeg-icon"
	class="flex items-center gap-2"
>
	<span class="font-mono text-lg font-bold">ffmpeg Website</span>
	<Icon icon="logos:ffmpeg-icon" class="h-6 w-6" />
</TauriLink>
<p class="font-mono text-sm">
	You can install ffmpeg from the official website, but it's much easier if you use a package
	manager of your platform.
</p>
<Tabs.Root value={_platform} class="mt-2 w-full">
	<div class="flex w-full justify-center">
		<Tabs.List>
			<Tabs.Trigger value="windows">Windows</Tabs.Trigger>
			<Tabs.Trigger value="macos">MacOS</Tabs.Trigger>
			<Tabs.Trigger value="linux">Linux</Tabs.Trigger>
		</Tabs.List>
	</div>
	<Tabs.Content value="macos" class="space-y-2">
		{#if !brewPath}
			<p class="font-mono text-sm text-red-400">
				Homebrew is not installed. Please install Homebrew first.
			</p>
		{/if}
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code={command.macos}
			lang="bash"
			{alreadyInstalled}
			autoInstallable={true}
		/>
	</Tabs.Content>
	<Tabs.Content value="windows" class="space-y-2">
		{#if !chocoPath}
			<p class="font-mono text-sm text-red-400">
				Chocolatey is not installed. Please install Chocolatey first.
			</p>
		{/if}
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code={command.windows}
			lang="bash"
			{alreadyInstalled}
		/>
	</Tabs.Content>
	<Tabs.Content value="linux" class="space-y-2">
		{#if !aptPath}
			<p class="font-mono text-sm text-red-400">
				`apt` is not installed. Please install `apt` first.
			</p>
			<p class="font-mono text-sm text-red-400">
				If you are on a different distro, I believe you can figure it out as a Linux user.
			</p>
		{/if}
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code={command.linux}
			lang="bash"
			{alreadyInstalled}
		/>
	</Tabs.Content>
</Tabs.Root>
