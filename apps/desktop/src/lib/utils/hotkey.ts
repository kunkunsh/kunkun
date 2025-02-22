import { getAllWindows } from "@tauri-apps/api/window"
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

export async function paste() {
	const _platform = os.platform()
	if (_platform === "macos") {
		await userInput.key("KeyPress", "MetaLeft")
		await sleep(20)
		await userInput.key("KeyPress", "KeyV")
		await sleep(100)
		await userInput.key("KeyRelease", "MetaLeft")
		await sleep(20)
		await userInput.key("KeyRelease", "KeyV")
	} else if (_platform === "windows" || _platform === "linux") {
		await userInput.key("KeyPress", "ShiftLeft")
		await sleep(20)
		await userInput.key("KeyPress", "Insert")
		await sleep(100)
		await userInput.key("KeyRelease", "ShiftLeft")
		await sleep(20)
		await userInput.key("KeyRelease", "Insert")
	} else {
		console.error("Unsupported platform: " + _platform)
	}
}
