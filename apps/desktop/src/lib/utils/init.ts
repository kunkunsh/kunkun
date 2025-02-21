import { appConfig, extensions } from "@/stores"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { info } from "@tauri-apps/plugin-log"
import { dev } from "$app/environment"
import { mapKeyToTauriKey, registerAppHotkey } from "./hotkey"
import { listenToReloadOneExtension } from "./tauri-events"

/**
 * Initialize the app
 */
export function init() {
	const window = getCurrentWindow()
	if (window.label === "main") {
		initMainWindow()
		listenToReloadOneExtension(({ payload: { extPath } }) => {
			info(`listenToReloadOneExtension in main window: ${extPath}`)
			extensions.reloadExtension(extPath)
		})
	}

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
