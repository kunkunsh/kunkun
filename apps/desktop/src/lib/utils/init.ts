import { appConfig, extensions } from "@/stores"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { error, info } from "@tauri-apps/plugin-log"
import { dev } from "$app/environment"
import { cleanClipboard } from "./clipboard"
import { vacuumSqlite } from "./db"
import { mapKeyToTauriKey, registerAppHotkey } from "./hotkey"
import { listenToReloadOneExtension } from "./tauri-events"

/**
 * Initialize the app
 */
export async function init() {
	const window = getCurrentWindow()
	if (window.label === "main") {
		initMainWindow()
		listenToReloadOneExtension(({ payload: { extPath } }) => {
			info(`listenToReloadOneExtension in main window: ${extPath}`)
			extensions.reloadExtension(extPath)
		})
	}
	await cleanClipboard()
		.then(() => {
			info("Cleaned clipboard")
		})
		.catch((e) => {
			error(`Failed to clean clipboard: ${e}`)
		})
	vacuumSqlite()
	if (!dev) {
		// document.addEventListener("contextmenu", function (event) {
		// 	event.preventDefault()
		// 	console.warn("contextmenu disabled in release mode", event)
		// })
	}
}

export function initMainWindow() {
	/* -------------------------------------------------------------------------- */
	/*                             Register App Hotkey                            */
	/* -------------------------------------------------------------------------- */
	const triggerHotkey = appConfig.get().triggerHotkey
	if (triggerHotkey && triggerHotkey.length > 0) {
		const hotkeyStr = triggerHotkey.map(mapKeyToTauriKey).join("+")
		info(`Registering hotkey: ${hotkeyStr}`)
		registerAppHotkey(hotkeyStr)
	} else {
		console.log("No hotkey found in config")
	}
}
