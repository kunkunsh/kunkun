<script lang="ts">
	import HotkeyInputPopover from "@/components/common/HotkeyInputPopover.svelte"
	import HotkeyPick from "@/components/standalone/settings/hotkey-pick.svelte"
	import { appConfig } from "@/stores"
	import { Button, Switch } from "@kksh/svelte5"
	import { Shiki } from "@kksh/ui"
	import { dev } from "$app/environment"
	import { onMount, type Snippet } from "svelte"
</script>

<main class="container flex flex-col space-y-2">
	<!-- <h3 class="text-mg mb-2 ml-3 font-bold">App Updates</h3> -->
	<ul class="rounded-lg border">
		<li>
			<span>Launch at Login</span>
			<Switch bind:checked={$appConfig.launchAtLogin} />
		</li>
		<li class="">
			<span>Hotkey</span>
			<!-- <HotkeyInput bind:keys={$appConfig.triggerHotkey} /> -->
			<!-- <HotkeyInputPopover class="" /> -->
			<HotkeyPick />
		</li>
		<li>
			<span>Menu Bar Icon</span>
			<Switch bind:checked={$appConfig.showInTray} />
		</li>
		<li>
			<span>Hide On Blur</span>
			<Switch bind:checked={$appConfig.hideOnBlur} />
		</li>
		<li>
			<span>Extension Auto Upgrade</span>
			<Switch bind:checked={$appConfig.extensionAutoUpgrade} />
		</li>
		<li>
			<span>Dev Extension HMR</span>
			<Switch bind:checked={$appConfig.hmr} />
		</li>
		<li>
			<span>Join Beta Updates</span>
			<Switch bind:checked={$appConfig.joinBetaProgram} />
		</li>

		<!-- <li>
				<span>Language</span>
				<Switch bind:checked={$appConfig} />
			</li> -->
	</ul>
	{#if dev}
		<Shiki class="w-full overflow-x-auto" lang="json" code={JSON.stringify($appConfig, null, 2)} />
	{/if}
</main>

<style scoped>
	li {
		@apply flex items-center justify-between border-b px-3 py-3;
	}
	ul li:last-child {
		@apply border-b-0;
	}
	li > span {
		@apply text-sm;
	}
</style>
