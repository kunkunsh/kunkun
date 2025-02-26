import { app } from "@tauri-apps/api"
import { getAllWindows, getCurrentWindow, type Window } from "@tauri-apps/api/window"
import { isRegistered, register, unregister } from "@tauri-apps/plugin-global-shortcut"
import { debug, info, warn } from "@tauri-apps/plugin-log"
import * as os from "@tauri-apps/plugin-os"
import * as userInput from "tauri-plugin-user-input-api"
import { sendNotificationWithPermission } from "./notification"
import { sleep } from "./time"

/**
 * Tauri global shortcut doesn't accept 'Meta' Key. This function maps browser detected keys to Tauri-accepted keys.
 * @param key
 */
export function mapKeyToTauriKey(key: string): string {
	if (key === "Meta") {
		return "Command"
	}
	return key
}

/**
 * Registers a global hotkey for the application. If the hotkey is already registered, it will be unregistered first.
 * When the hotkey is pressed, it toggles the visibility and focus of the main window.
 * @param hotkeyStr - The hotkey string to register.
 */
export async function registerAppHotkey(hotkeyStr: string) {
	if (await isRegistered(hotkeyStr)) {
		warn(`Hotkey (${hotkeyStr}) already registered`)
		await unregister(hotkeyStr)
	}
	info(`Registering hotkey: ${hotkeyStr}`)
	return register(hotkeyStr, async (e) => {
		if (e.state === "Released") {
			const wins = await getAllWindows()
			const mainWin = wins.find((w) => w.label === "main")
			if (!mainWin) {
				return sendNotificationWithPermission(
					"No main window found",
					"Please open main window first"
				)
			}
			const isVisible = await mainWin.isVisible()
			const isFocused = await mainWin.isFocused()
			if (isVisible) {
				if (isFocused) {
					mainWin.hide()
				} else {
					mainWin.setFocus()
				}
			} else {
				mainWin.show()
				mainWin.setFocus()
			}
		}
	})
}

/**
 * Updates the application's global hotkey. If an old hotkey is provided, it will be unregistered first.
 * @param newHotkey - The new hotkey combination to register.
 * @param oldHotkey - The old hotkey combination to unregister, if any.
 */
export async function updateAppHotkey(newHotkey: string[], oldHotkey?: string[] | null) {
	if (oldHotkey) {
		const hotkeyStr = oldHotkey.map(mapKeyToTauriKey).join("+")
		if (await isRegistered(hotkeyStr)) {
			await unregister(hotkeyStr)
		}
	}
	const hotkeyStr = newHotkey.map(mapKeyToTauriKey).join("+")
	return registerAppHotkey(hotkeyStr)
}

/**
 * Simulates a key combination press and release.
 * @param keys - The array of keys to press and release.
 */
export async function applyKeyComb(keys: userInput.Key[]) {
	// await Promise.all(keys.map((key) => userInput.key("KeyPress", key)))
	for (const key of keys) {
		await userInput.key("KeyPress", key)
		await sleep(100)
	}
	await sleep(150)
	for (const key of keys) {
		await userInput.key("KeyRelease", key)
		await sleep(100)
	}
}

/**
 * Simulates a paste operation based on the operating system.
 * On macOS, it uses Command+V. On Windows and Linux, it uses Shift+Insert.
 */
export async function paste() {
	const _platform = os.platform()
	if (_platform === "macos") {
		return applyKeyComb(["MetaLeft", "KeyV"])
	} else if (_platform === "windows" || _platform === "linux") {
		return applyKeyComb(["ShiftLeft", "Insert"])
	} else {
		console.error("Unsupported platform: " + _platform)
	}
}

export async function hideAndPaste(win?: Window) {
	return app
		.hide()
		.then(() => sleep(60))
		.then(() => (win ?? getCurrentWindow()).hide())
		.then(() => sleep(60))
		.then(() => paste())
}
