<script lang="ts">
	import HotkeyPick from "@/components/standalone/settings/hotkey-pick.svelte"
	import { LanguageMap } from "@/constants"
	import * as m from "@/paraglide/messages"
	import * as i18n from "@/paraglide/runtime"
	import { appConfig } from "@/stores"
	import { Select, Switch } from "@kksh/svelte5"

	const languages = i18n.availableLanguageTags.map((lang) => ({
		value: lang,
		label: LanguageMap[lang] ?? lang
	}))

	let value = $state(i18n.languageTag())
	$effect(() => {
		appConfig.setLanguage(value)
		i18n.setLanguageTag(value)
	})

	const triggerContent = $derived(languages.find((f) => f.value === value)?.label ?? "Language")
</script>

<ul class="rounded-lg border">
	<li>
		<span>{m.settings_launch_at_login()}</span>
		<Switch bind:checked={$appConfig.launchAtLogin} />
	</li>
	<li class="">
		<span>{m.settings_hotkey()}</span>
		<HotkeyPick />
	</li>
	<li>
		<span>{m.settings_menu_bar_icon()}</span>
		<Switch bind:checked={$appConfig.showInTray} />
	</li>
	<li>
		<span>{m.settings_hide_on_blur()}</span>
		<Switch bind:checked={$appConfig.hideOnBlur} />
	</li>
	<li>
		<span>{m.settings_extension_auto_upgrade()}</span>
		<Switch bind:checked={$appConfig.extensionAutoUpgrade} />
	</li>
	<li>
		<span>{m.settings_dev_extension_hmr()}</span>
		<Switch bind:checked={$appConfig.hmr} />
	</li>
	<li>
		<span>{m.settings_join_beta_updates()}</span>
		<Switch bind:checked={$appConfig.joinBetaProgram} />
	</li>

	<li>
		<span>{m.settings_developer_mode()}</span>
		<Switch bind:checked={$appConfig.developerMode} />
	</li>
	<li>
		<span>{m.settings_language()}</span>

		<Select.Root type="single" name="language" bind:value>
			<Select.Trigger class="w-fit">
				{triggerContent}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.GroupHeading>{m.settings_language()}</Select.GroupHeading>
					{#each languages as lang}
						<Select.Item value={lang.value} label={lang.label}>{lang.label}</Select.Item>
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
