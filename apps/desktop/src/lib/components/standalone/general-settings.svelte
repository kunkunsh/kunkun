<script lang="ts">
	import HotkeyPick from "@/components/standalone/settings/hotkey-pick.svelte"
	import { appConfig } from "@/stores"
	import { Button, Switch } from "@kksh/svelte5"
</script>

<ul class="rounded-lg border">
	<li>
		<span>Launch at Login</span>
		<Switch bind:checked={$appConfig.launchAtLogin} />
	</li>
	<li class="">
		<span>Hotkey</span>
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

	<li>
		<span>Developer Mode</span>
		<Switch bind:checked={$appConfig.developerMode} />
	</li>
</ul>

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
