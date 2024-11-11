import { getExtensionsFolder } from "@/constants"
import { createTauriSyncStore, type WithSyncStore } from "@/utils/sync-store"
import { updateTheme, type ThemeConfig } from "@kksh/svelte5"
import { PersistedAppConfig, type AppConfig } from "@kksh/types"
import { debug, error } from "@tauri-apps/plugin-log"
import * as os from "@tauri-apps/plugin-os"
import { load } from "@tauri-apps/plugin-store"
import { get } from "svelte/store"
import * as v from "valibot"

export const defaultAppConfig: AppConfig = {
	isInitialized: false,
	platform: "macos",
	theme: {
		theme: "zinc",
		radius: 0.5,
		lightMode: "auto"
	},
	triggerHotkey: null,
	launchAtLogin: true,
	showInTray: true,
	devExtensionPath: null,
	extensionsInstallDir: undefined,
	hmr: false,
	hideOnBlur: true,
	extensionAutoUpgrade: true,
	joinBetaProgram: false,
	onBoarded: false,
	developerMode: false
}

interface AppConfigAPI {
	init: () => Promise<void>
	get: () => AppConfig
	setTheme: (theme: ThemeConfig) => void
	setDevExtensionPath: (devExtensionPath: string | null) => void
	setTriggerHotkey: (triggerHotkey: string[]) => void
}

function createAppConfig(): WithSyncStore<AppConfig> & AppConfigAPI {
	const store = createTauriSyncStore("app-config", defaultAppConfig)

	async function init() {
		debug("Initializing app config")
		const persistStore = await load("kk-config.json", { autoSave: true })
		const loadedConfig = await persistStore.get("config")
		const parseRes = v.safeParse(PersistedAppConfig, loadedConfig)
		if (parseRes.success) {
			console.log("Parse Persisted App Config Success", parseRes.output)
			const extensionsInstallDir = await getExtensionsFolder()
			store.update((config) => ({
				...config,
				...parseRes.output,
				isInitialized: true,
				extensionsInstallDir,
				platform: os.platform()
			}))
		} else {
			error("Failed to parse app config, going to remove it and reinitialize")
			console.error(v.flatten<typeof PersistedAppConfig>(parseRes.issues))
			await persistStore.clear()
			await persistStore.set("config", v.parse(PersistedAppConfig, defaultAppConfig))
		}

		store.subscribe(async (config) => {
			console.log("Saving app config", config)
			await persistStore.set("config", config)
			updateTheme(config.theme)
		})
	}

	return {
		...store,
		get: () => get(store),
		setTheme: (theme: ThemeConfig) => store.update((config) => ({ ...config, theme })),
		setDevExtensionPath: (devExtensionPath: string | null) => {
			console.log("setDevExtensionPath", devExtensionPath)
			store.update((config) => ({ ...config, devExtensionPath }))
		},
		setTriggerHotkey: (triggerHotkey: string[]) => {
			store.update((config) => ({ ...config, triggerHotkey }))
		},
		init
	}
}

export const appConfig = createAppConfig()
