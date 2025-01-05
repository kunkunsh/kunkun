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
