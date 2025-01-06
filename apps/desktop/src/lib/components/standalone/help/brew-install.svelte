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
	let _platform = $state(platform())

	onMount(async () => {
		brewPath = await whereIsCommand("brew")
	})

	function onInstallSuccess() {}
	let alreadyInstalled = $derived(brewPath != "")
</script>

<h1 class="font-mono text-2xl font-bold">Install Homebrew</h1>
<TauriLink
	href="/app/help/brew-install"
	icon={IconEnum.Iconify}
	iconValue="devicon:homebrew"
	class="flex items-center"
>
	<span class="text-lg">Homebrew Website</span>
	<Icon icon="devicon:homebrew" class="h-6 w-6" />
</TauriLink>
{#if _platform !== "macos"}
	<p class="font-mono text-sm text-red-500">Homebrew is only available on MacOS.</p>
{/if}
{#if alreadyInstalled}
	<div class="flex items-center gap-2 font-mono text-sm">
		<span>✅</span>
		<span>Homebrew is already installed at </span>
		<pre class="text-sm">{brewPath}</pre>
	</div>
{:else}
	<div class="flex items-center gap-2 font-mono text-sm">
		<span>❌</span>
		<span>Homebrew is not installed</span>
	</div>
{/if}
<p class="font-mono text-sm">
	Some extensions require Homebrew to enable advanced features. Homebrew is optional but
	recommended.
</p>

<InstallCodeBlock
	onSuccess={onInstallSuccess}
	code={`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`}
	lang="bash"
	{alreadyInstalled}
	autoInstallable={!alreadyInstalled}
/>
