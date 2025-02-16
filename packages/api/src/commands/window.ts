import { invoke } from "@tauri-apps/api/core"
import { generateJarvisPluginCommand } from "./common"

/**
 * Given a window label, set the titlebar to transparent for macos.
 * If no window label is provided, the current window will be used.
 * @param windowLabel
 */
export async function setTransparentTitlebar(windowLabel?: string): Promise<void> {
	await invoke<void>(generateJarvisPluginCommand("set_transparent_titlebar"), {
		windowLabel
	})
}

/**
 * Given a window label, show it. It is a fancier version of bult-in
 * wry's `show` function which respects current mouse position.
 * If no window label is provided, the current window will be used.
 * @param showOnCursorPosition
 * @param windowLabel
 */
export async function showWindow(showOnCursorPosition: boolean, windowLabel?: string): Promise<void> {
	await invoke<void>(generateJarvisPluginCommand("show_window"), {
		showOnCursorPosition,
		windowLabel,
	})
}
