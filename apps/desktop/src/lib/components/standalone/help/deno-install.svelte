<script lang="ts">
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { Button, Tabs } from "@kksh/svelte5"
	import { Shiki } from "@kksh/ui"
	import { platform } from "@tauri-apps/plugin-os"
	import { onMount } from "svelte"
	import ArrowLeft from "svelte-radix/ArrowLeft.svelte"
	import { whereIsCommand } from "tauri-plugin-shellx-api"
	import InstallCodeBlock from "../../common/install-code-block.svelte"

	let brewPath = $state("")
	let denoPath = $state("")
	let cargoPath = $state("")
	let _platform = $state(platform())

	onMount(async () => {
		;[denoPath, brewPath, cargoPath] = await Promise.all([
			whereIsCommand("deno"),
			whereIsCommand("brew"),
			whereIsCommand("cargo")
		])
	})

	let alreadyInstalled = $derived(denoPath != "")
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" onclick={goBack} class="absolute left-2 top-2">
	<ArrowLeft class="size-4" />
</Button>
<main class="container pt-12">
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
	<p class="font-mono text-sm">
		Some extensions require Deno to enable advanced features. Deno provides a secure, sandboxed
		runtime environment for executing extension code safely.
	</p>
	<Tabs.Root value={_platform} class="w-full">
		<div class="flex w-full justify-center">
			<Tabs.List>
				<Tabs.Trigger value="windows">Windows</Tabs.Trigger>
				<Tabs.Trigger value="macos">MacOS</Tabs.Trigger>
				<Tabs.Trigger value="linux">Linux</Tabs.Trigger>
			</Tabs.List>
		</div>
		<Tabs.Content value="macos" class="space-y-2">
			<InstallCodeBlock
				code="curl -fsSL https://deno.land/install.sh | sh"
				lang="bash"
				{alreadyInstalled}
			/>
			{#if brewPath}
				<InstallCodeBlock code="brew install deno" lang="bash" {alreadyInstalled} />
			{/if}
		</Tabs.Content>
		<Tabs.Content value="windows" class="space-y-2">
			<InstallCodeBlock
				code="irm https://deno.land/install.ps1 | iex"
				lang="powershell"
				{alreadyInstalled}
			/>
		</Tabs.Content>
		<Tabs.Content value="linux" class="space-y-2">
			<InstallCodeBlock
				code="curl -fsSL https://deno.land/install.sh | sh"
				lang="bash"
				{alreadyInstalled}
			/>
		</Tabs.Content>
	</Tabs.Root>
	{#if cargoPath}
		<InstallCodeBlock
			class="mt-2"
			code="cargo install deno --locked"
			lang="bash"
			{alreadyInstalled}
		/>
	{/if}
</main>
