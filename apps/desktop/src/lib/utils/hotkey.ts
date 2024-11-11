import { getAllWindows } from "@tauri-apps/api/window"
import { isRegistered, register, unregister } from "@tauri-apps/plugin-global-shortcut"
import { debug, info } from "@tauri-apps/plugin-log"
import { sendNotificationWithPermission } from "./notification"

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
		debug(`Hotkey (${hotkeyStr}) already registered`)
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
