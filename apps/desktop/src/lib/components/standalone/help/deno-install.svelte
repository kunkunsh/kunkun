<script lang="ts">
	import InstallCodeBlock from "@/components/common/install-code-block.svelte"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { Button, Tabs } from "@kksh/svelte5"
	import { platform } from "@tauri-apps/plugin-os"
	import { onMount } from "svelte"
	import ArrowLeft from "svelte-radix/ArrowLeft.svelte"
	import { toast } from "svelte-sonner"
	import { whereIsCommand } from "tauri-plugin-shellx-api"

	let brewPath = $state("")
	let denoPath = $state("")
	let cargoPath = $state("")
	let scoopPath = $state("")
	let chocoPath = $state("")
	let wingetPath = $state("")
	let _platform = $state(platform())

	onMount(async () => {
		;[denoPath, brewPath, cargoPath, scoopPath, chocoPath, wingetPath] = await Promise.all([
			whereIsCommand("deno"),
			whereIsCommand("brew"),
			whereIsCommand("cargo"),
			whereIsCommand("scoop"),
			whereIsCommand("choco"),
			whereIsCommand("winget")
		])
	})

	async function onInstallSuccess() {
		denoPath = await whereIsCommand("deno")
		console.log("new denoPath", denoPath)
		if (!denoPath) {
			toast.warning("Installation succeeds, but deno is not found in your PATH", {
				description: "Please verify by yourself, and restart this app"
			})
		}
	}

	let alreadyInstalled = $derived(denoPath != "")
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" onclick={goBack} class="absolute left-2 top-2">
	<ArrowLeft class="size-4" />
</Button>
<h1 class="font-mono text-2xl font-bold">Install Deno</h1>
<p class="font-mono text-sm">
	Some extensions require Deno to enable advanced features. Deno provides a secure, sandboxed
	runtime environment for executing extension code safely. It is optional but recommended.
</p>
<p class="font-mono text-sm">Choose any installation method below.</p>
<!-- <p class="font-mono text-sm">
	If you are unsure, you can use <strong class="text-lg">Auto Install</strong>.
</p> -->
<p class="font-mono text-sm text-red-400">
	After installation, ensure the `deno` command is accessible from your system's PATH.
</p>
<!-- {#if _platform === "macos" || _platform === "linux"}
	<p class="font-mono text-sm text-red-400">
		Installation with <span class="font-bold text-green-500">curl</span> command likely requires manual
		configuration. So auto install is disabled. Please copy the command and run it in a terminal.
	</p>
{/if} -->
{#if denoPath}
	<div class="flex items-center gap-2">
		<span>✅</span>
		<span>Deno is already installed at </span>
		<pre class="text-sm">{denoPath}</pre>
	</div>
{:else}
	<div class="flex items-center gap-2">
		<span>❌</span>
		<span>Deno is not installed</span>
	</div>
{/if}
<Tabs.Root value={_platform} class="mt-2 w-full">
	<div class="flex w-full justify-center">
		<Tabs.List>
			<Tabs.Trigger value="windows">Windows</Tabs.Trigger>
			<Tabs.Trigger value="macos">MacOS</Tabs.Trigger>
			<Tabs.Trigger value="linux">Linux</Tabs.Trigger>
		</Tabs.List>
	</div>
	<Tabs.Content value="macos" class="space-y-2">
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code="curl -fsSL https://deno.land/install.sh | sh"
			lang="bash"
			{alreadyInstalled}
		/>
		{#if brewPath}
			<InstallCodeBlock
				onSuccess={onInstallSuccess}
				code="brew install deno"
				lang="bash"
				{alreadyInstalled}
				autoInstallable={true}
			/>
		{/if}
	</Tabs.Content>
	<Tabs.Content value="windows" class="space-y-2">
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code="irm https://deno.land/install.ps1 | iex"
			lang="bash"
			{alreadyInstalled}
		/>
		{#if scoopPath}
			<InstallCodeBlock
				onSuccess={onInstallSuccess}
				code="scoop install deno"
				lang="bash"
				autoInstallable={true}
				{alreadyInstalled}
			/>
		{/if}
		{#if chocoPath}
			<InstallCodeBlock
				onSuccess={onInstallSuccess}
				code="choco install deno"
				lang="bash"
				autoInstallable={true}
				{alreadyInstalled}
			/>
		{/if}
		{#if wingetPath}
			<InstallCodeBlock
				onSuccess={onInstallSuccess}
				code="winget install deno"
				lang="bash"
				autoInstallable={true}
				{alreadyInstalled}
			/>
		{/if}
	</Tabs.Content>
	<Tabs.Content value="linux" class="space-y-2">
		<InstallCodeBlock
			onSuccess={onInstallSuccess}
			code="curl -fsSL https://deno.land/install.sh | sh"
			lang="bash"
			{alreadyInstalled}
		/>
	</Tabs.Content>
</Tabs.Root>
{#if cargoPath}
	<p class="mt-2 font-mono text-sm">
		Seeing this message means `cargo` is detected and you are a programmer. `cargo install` allows
		you to install `deno` from rust source code. But rust compiles super slow (a few minutes), so
		auto install is disabled. If you really want to use this method, please copy the command and run
		it in a terminal.
	</p>
	<InstallCodeBlock
		onSuccess={onInstallSuccess}
		class="mt-2"
		code="cargo install deno --locked"
		lang="bash"
		{alreadyInstalled}
	/>
{/if}
