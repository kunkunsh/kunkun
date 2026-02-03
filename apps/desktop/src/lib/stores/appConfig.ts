import { getExtensionsFolder } from "@/constants"
import type { SearchPath } from "@kksh/api/models"
import { updateTheme, type ThemeConfig } from "@kksh/svelte5"
import { LoadingAnimation, PersistedAppConfig, type AppConfigState } from "@kksh/types"
import { debug, error, info } from "@tauri-apps/plugin-log"
import * as os from "@tauri-apps/plugin-os"
import { load } from "@tauri-apps/plugin-store"
import { Store } from "@tauri-store/svelte"
import { toast } from "svelte-sonner"
import { get, writable } from "svelte/store"
import * as v from "valibot"
import { browser } from '$app/environment'

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
	appSearchPaths: [],
	loadingAnimation: "kunkun-dancing",
	useGtkTheme: false
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
	setLoadingAnimation: (loadingAnimation: LoadingAnimation) => void
	setUseGtkTheme: (useGtkTheme: boolean) => void
}

class AppConfigStore extends Store<AppConfigState> implements AppConfigAPI {
	constructor() {
		super("app-config", defaultAppConfig, {
			saveOnChange: true
		})
		if (browser) {
			this.start().catch((err) => {
				error("Failed to start app config store", err)
				toast.error("Failed to start app config store", { description: err.message })
			})
		} else {
			// On server, set as loaded with defaults
			appConfigLoaded.set(true)
		}
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
	setLoadingAnimation(loadingAnimation: LoadingAnimation) {
		this.update((config) => ({ ...config, loadingAnimation }))
	}
	setUseGtkTheme(useGtkTheme: boolean) {
		this.update((config) => ({ ...config, useGtkTheme }))
	}
}

// export const appConfig = createAppConfig()
export const appConfig = new AppConfigStore()
