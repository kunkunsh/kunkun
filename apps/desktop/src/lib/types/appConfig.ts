import { LightMode } from "@kksh/api/models"
import type { Platform } from "@tauri-apps/plugin-os"
import * as v from "valibot"

export const PersistedAppConfig = v.object({
	theme: v.object({
		theme: v.string(),
		radius: v.number(),
		lightMode: LightMode
	}),
	triggerHotkey: v.nullable(v.array(v.string())),
	launchAtLogin: v.boolean(),
	showInTray: v.boolean(),
	devExtensionPath: v.nullable(v.string()),
	hmr: v.boolean(),
	hideOnBlur: v.boolean(),
	extensionAutoUpgrade: v.boolean(),
	joinBetaProgram: v.boolean(),
	onBoarded: v.boolean()
})

export type PersistedAppConfig = v.InferOutput<typeof PersistedAppConfig>

// export const AppConfig = v.object({
// 	isInitialized: v.boolean(),
// 	...PersistedAppConfig.entries,
// 	extensionPath: v.optional(v.string())
// })
export type AppConfig = PersistedAppConfig & {
	isInitialized: boolean
	extensionPath?: string
	platform: Platform
}
