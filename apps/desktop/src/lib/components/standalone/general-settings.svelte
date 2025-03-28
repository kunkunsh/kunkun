<script lang="ts">
	import HotkeyPick from "@/components/standalone/settings/hotkey-pick.svelte"
	import { LanguageMap } from "@/constants"
	import { i18n, switchToLanguage } from "@/i18n"
	import * as m from "@/paraglide/messages"
	import {
		availableLanguageTags,
		languageTag,
		setLanguageTag,
		type AvailableLanguageTag
	} from "@/paraglide/runtime"
	import { appConfig } from "@/stores"
	import { Select, Switch } from "@kksh/svelte5"
	import type { LoadingAnimation } from "@kksh/types"
	import * as autoStart from "@tauri-apps/plugin-autostart"
	import { onMount } from "svelte"
	import { toast } from "svelte-sonner"

	const languages = availableLanguageTags.map((lang) => ({
		value: lang,
		label: LanguageMap[lang] ?? lang
	}))
	let loadingAnimation = $state<LoadingAnimation>("spinning-circle")
	const loadingAnimations = ["spinning-circle", "kunkun-dancing"] as const
	let launchAtLogin = $state(false)
	let language = $state(languageTag())
	onMount(() => {
		autoStart.isEnabled().then((enabled) => {
			launchAtLogin = enabled
		})
		loadingAnimation = $appConfig.loadingAnimation
	})
	const triggerContent = $derived(languages.find((f) => f.value === language)?.label ?? "Language")
</script>

<ul class="rounded-lg border">
	<li>
		<span>{m.settings_general_launch_at_login()}</span>
		<Switch
			bind:checked={launchAtLogin}
			onCheckedChange={(checked) => {
				const action = checked ? autoStart.enable : autoStart.disable
				action()
					.then(() => {
						toast.success(checked ? "Enabled" : "Disabled")
					})
					.catch((err) => {
						toast.error(checked ? "Failed to enable" : "Failed to disable", {
							description: err.message
						})
					})
			}}
		/>
	</li>
	<li class="">
		<span>{m.settings_general_hotkey()}</span>
		<HotkeyPick />
	</li>
	<li>
		<span>{m.settings_general_menu_bar_icon()}</span>
		<Switch bind:checked={$appConfig.showInTray} />
	</li>
	<li>
		<span>{m.settings_general_hide_on_blur()}</span>
		<Switch bind:checked={$appConfig.hideOnBlur} />
	</li>
	<li>
		<span>{m.settings_general_extension_auto_upgrade()}</span>
		<Switch bind:checked={$appConfig.extensionAutoUpgrade} />
	</li>
	<li>
		<span>{m.settings_general_dev_extension_hmr()}</span>
		<Switch bind:checked={$appConfig.hmr} />
	</li>
	<li>
		<span>{m.settings_general_join_beta_updates()}</span>
		<Switch bind:checked={$appConfig.joinBetaProgram} />
	</li>

	<li>
		<span>{m.settings_general_developer_mode()}</span>
		<Switch bind:checked={$appConfig.developerMode} />
	</li>
	<li>
		<span>{m.settings_general_language()}</span>

		<Select.Root type="single" name="language" bind:value={language}>
			<Select.Trigger class="w-fit">
				{triggerContent}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.GroupHeading>{m.settings_general_language()}</Select.GroupHeading>
					{#each languages as lang}
						<Select.Item
							onclick={() => {
								appConfig.setLanguage(lang.value)
								switchToLanguage(lang.value as AvailableLanguageTag)
							}}
							value={lang.value}
							label={lang.label}>{lang.label}</Select.Item
						>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</li>
	<li>
		<span>Loading Animation</span>

		<Select.Root type="single" name="loadingAnimation" bind:value={loadingAnimation}>
			<Select.Trigger class="w-fit">
				{loadingAnimation}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.GroupHeading>Loading Animation</Select.GroupHeading>
					{#each loadingAnimations as anim}
						<Select.Item
							onclick={() => {
								appConfig.setLoadingAnimation(anim)
							}}
							value={anim}
							label={anim}
						>
							{anim}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
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
