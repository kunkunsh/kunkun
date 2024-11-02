import { invoke } from "@tauri-apps/api/core"
import { generateJarvisPluginCommand } from "./common"

export function openDevTools(): Promise<void> {
	return invoke(generateJarvisPluginCommand("open_devtools"))
}

export function closeDevTools(): Promise<void> {
	return invoke(generateJarvisPluginCommand("close_devtools"))
}

export function toggleDevTools(): Promise<void> {
	return invoke(generateJarvisPluginCommand("toggle_devtools"))
}

export function isDevToolsOpen(): Promise<boolean> {
	return invoke(generateJarvisPluginCommand("is_devtools_open"))
}

/**
 * Check if the app is running in development mode.
 * @returns true if the app is running in development mode, false otherwise
 */
export function appIsDev(): Promise<boolean> {
	return invoke(generateJarvisPluginCommand("app_is_dev"))
}
