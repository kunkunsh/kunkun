import { invoke } from "@tauri-apps/api/core"
import { generateJarvisPluginCommand } from "./common"

/**
 * @returns <app data dir>/extensions
 */
export function getDefaultExtensionsDir(): Promise<String> {
	return invoke(generateJarvisPluginCommand("get_default_extensions_dir"))
}

/**
 * @returns <app data dir>/extensions_storage
 */
export function getDefaultExtensionsStorageDir(): Promise<String> {
	return invoke(generateJarvisPluginCommand("get_default_extensions_storage_dir"))
}
