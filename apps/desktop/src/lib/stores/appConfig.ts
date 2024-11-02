import { getExtensionsFolder } from "@/constants"
import { PersistedAppConfig, type AppConfig } from "@/types/appConfig"
import { themeConfigStore, updateTheme, type ThemeConfig } from "@kksh/svelte5"
import * as tauriPath from "@tauri-apps/api/path"
import { remove } from "@tauri-apps/plugin-fs"
import { debug, error } from "@tauri-apps/plugin-log"
import * as os from "@tauri-apps/plugin-os"
import { load } from "@tauri-apps/plugin-store"
import { get, writable, type Writable } from "svelte/store"
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
	extensionPath: undefined,
	hmr: false,
	hideOnBlur: true,
	extensionAutoUpgrade: true,
	joinBetaProgram: false,
	onBoarded: false
}

interface AppConfigAPI {
	init: () => Promise<void>
	setTheme: (theme: ThemeConfig) => void
	setDevExtensionPath: (devExtensionPath: string | null) => void
}

function createAppConfig(): Writable<AppConfig> & AppConfigAPI {
	const { subscribe, update, set } = writable<AppConfig>(defaultAppConfig)

	async function init() {
		debug("Initializing app config")
		const appDataDir = await tauriPath.appDataDir()
		// const appConfigPath = await tauriPath.join(appDataDir, "appConfig.json")
		// debug(`appConfigPath: ${appConfigPath}`)
		const persistStore = await load("kk-config.json", { autoSave: true })
		const loadedConfig = await persistStore.get("config")
		const parseRes = v.safeParse(PersistedAppConfig, loadedConfig)
		if (parseRes.success) {
			console.log("Parse Persisted App Config Success", parseRes.output)
			const extensionPath = await tauriPath.join(appDataDir, "extensions")
			update((config) => ({ ...config, ...parseRes.output, isInitialized: true, extensionPath, platform: os.platform() }))
		} else {
			error("Failed to parse app config, going to remove it and reinitialize")
			console.error(v.flatten<typeof PersistedAppConfig>(parseRes.issues))
			await persistStore.clear()
			await persistStore.set("config", v.parse(PersistedAppConfig, defaultAppConfig))
		}

		subscribe(async (config) => {
			console.log("Saving app config", config)
			await persistStore.set("config", config)
			updateTheme(config.theme)
		})
	}

	return {
		setTheme: (theme: ThemeConfig) => update((config) => ({ ...config, theme })),
		setDevExtensionPath: (devExtensionPath: string | null) => {
			console.log("setDevExtensionPath", devExtensionPath)
			update((config) => ({ ...config, devExtensionPath }))
		},
		init,
		subscribe,
		update,
		set
	}
}

export const appConfig = createAppConfig()
