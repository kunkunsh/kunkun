import { getExtensionsFolder } from "@/constants"
import type { SearchPath } from "@kksh/api/models"
import { updateTheme, type ThemeConfig } from "@kksh/svelte5"
import { PersistedAppConfig, type AppConfigState } from "@kksh/types"
import { debug, error, info } from "@tauri-apps/plugin-log"
import * as os from "@tauri-apps/plugin-os"
import { load } from "@tauri-apps/plugin-store"
import { toast } from "svelte-sonner"
import { get, writable } from "svelte/store"
import { Store } from "tauri-plugin-svelte"
import * as v from "valibot"

export const defaultAppConfig: AppConfigState = {
	isInitialized: false,
	platform: "macos",
	language: "en",
	theme: {
		theme: "zinc",
		radius: 0.5,
		lightMode: "auto"
	},
	triggerHotkey: null,
	showInTray: true,
	devExtensionPath: null,
	extensionsInstallDir: undefined,
	hmr: false,
	hideOnBlur: true,
	extensionAutoUpgrade: true,
	joinBetaProgram: false,
	onBoarded: false,
	developerMode: false,
	appSearchPaths: []
}

export const appConfigLoaded = writable(false)

interface AppConfigAPI {
	init: () => Promise<void>
	get: () => AppConfigState
	setTheme: (theme: ThemeConfig) => void
	setDevExtensionPath: (devExtensionPath: string | null) => void
	setTriggerHotkey: (triggerHotkey: string[]) => void
	setOnBoarded: (onBoarded: boolean) => void
	setLanguage: (language: string) => void
	addAppSearchPath: (appSearchPath: SearchPath) => void
	removeAppSearchPath: (appSearchPath: SearchPath) => void
}

class AppConfigStore extends Store<AppConfigState> implements AppConfigAPI {
	constructor() {
		super("app-config", defaultAppConfig, {
			saveOnChange: true
		})
		this.start().catch((err) => {
			error("Failed to start app config store", err)
			toast.error("Failed to start app config store", { description: err.message })
		})
	}
	async init() {
		debug("Initializing app config")
		const extensionsInstallDir = await getExtensionsFolder()
		this.update((config) => ({
			...config,
			isInitialized: true,
			platform: os.platform(),
			extensionsInstallDir
		}))
		appConfigLoaded.set(true)
	}

	get() {
		return get(this)
	}
	setTheme(theme: ThemeConfig) {
		this.update((config) => ({ ...config, theme }))
	}
	setDevExtensionPath(devExtensionPath: string | null) {
		info(`setDevExtensionPath ${devExtensionPath}`)
		this.update((config) => ({ ...config, devExtensionPath }))
	}
	setTriggerHotkey(triggerHotkey: string[]) {
		this.update((config) => ({ ...config, triggerHotkey }))
	}
	setOnBoarded(onBoarded: boolean) {
		this.update((config) => ({ ...config, onBoarded }))
	}
	setLanguage(language: string) {
		this.update((config) => ({ ...config, language }))
	}
	addAppSearchPath(appSearchPath: SearchPath) {
		this.update((config) => ({
			...config,
			appSearchPaths: [...config.appSearchPaths, appSearchPath]
		}))
	}
	removeAppSearchPath(appSearchPath: SearchPath) {
		this.update((config) => ({
			...config,
			appSearchPaths: config.appSearchPaths.filter((path) => path.path !== appSearchPath.path)
		}))
	}
}

// function createAppConfig(): WithSyncStore<AppConfigState & { language: string }> & AppConfigAPI {
// 	const store = createTauriSyncStore("app-config", defaultAppConfig)

// 	async function init() {
// 		debug("Initializing app config")
// 		const persistStore = await load("kk-config.json", { autoSave: true })
// 		let loadedConfig = await persistStore.get("config")
// 		if (typeof loadedConfig === "object") {
// 			loadedConfig = { ...defaultAppConfig, ...loadedConfig }
// 		}
// 		const parseRes = v.safeParse(PersistedAppConfig, loadedConfig)
// 		if (parseRes.success) {
// 			console.log("Parse Persisted App Config Success", parseRes.output)
// 			const extensionsInstallDir = await getExtensionsFolder()
// 			store.update((config) => ({
// 				...config,
// 				...parseRes.output,
// 				isInitialized: true,
// 				extensionsInstallDir,
// 				platform: os.platform()
// 			}))
// 		} else {
// 			error("Failed to parse app config, going to remove it and reinitialize")
// 			console.error(v.flatten<typeof PersistedAppConfig>(parseRes.issues))
// 			await persistStore.clear()
// 			await persistStore.set("config", v.parse(PersistedAppConfig, defaultAppConfig))
// 		}
// 		store.subscribe(async (config) => {
// 			console.log("Saving app config", config)
// 			await persistStore.set("config", config)
// 			updateTheme(config.theme)
// 		})
// 	}

// 	return {
// 		...store,
// 		get: () => get(store),
// 		setTheme: (theme: ThemeConfig) => store.update((config) => ({ ...config, theme })),
// 		setDevExtensionPath: (devExtensionPath: string | null) => {
// 			console.log("setDevExtensionPath", devExtensionPath)
// 			store.update((config) => ({ ...config, devExtensionPath }))
// 		},
// 		setTriggerHotkey: (triggerHotkey: string[]) => {
// 			store.update((config) => ({ ...config, triggerHotkey }))
// 		},
// 		setOnBoarded: (onBoarded: boolean) => {
// 			store.update((config) => ({ ...config, onBoarded }))
// 		},
// 		setLanguage: (language: string) => {
// 			store.update((config) => ({ ...config, language }))
// 		},
// 		addAppSearchPath: (appSearchPath: SearchPath) => {
// 			store.update((config) => ({
// 				...config,
// 				appSearchPaths: [...config.appSearchPaths, appSearchPath]
// 			}))
// 		},
// 		removeAppSearchPath: (appSearchPath: SearchPath) => {
// 			store.update((config) => ({
// 				...config,
// 				appSearchPaths: config.appSearchPaths.filter((path) => path.path !== appSearchPath.path)
// 			}))
// 		},
// 		init
// 	}
// }

// export const appConfig = createAppConfig()
export const appConfig = new AppConfigStore()
