import { invoke } from "@tauri-apps/api/core"
import { ExtensionLabelMap } from "../models/extension"
import { generateJarvisPluginCommand } from "./common"

export function isWindowLabelRegistered(label: string): Promise<boolean> {
	return invoke(generateJarvisPluginCommand("is_window_label_registered"), { label })
}

/**
 * @param extensionPath
 * @returns Window Label
 */
export function registerExtensionWindow(options: {
	extensionPath: string
	windowLabel?: string
	dist?: string
}): Promise<string> {
	const { extensionPath, windowLabel, dist } = options
	return invoke(generateJarvisPluginCommand("register_extension_window"), {
		extensionPath,
		windowLabel,
		dist
	})
}

export function unregisterExtensionWindow(label: string): Promise<void> {
	console.log("unregisterExtensionWindow", label)
	return invoke(generateJarvisPluginCommand("unregister_extension_window"), { label })
}

export function registerExtensionSpawnedProcess(windowLabel: string, pid: number): Promise<void> {
	return invoke(generateJarvisPluginCommand("register_extension_spawned_process"), {
		windowLabel,
		pid
	})
}

export function unregisterExtensionSpawnedProcess(windowLabel: string, pid: number): Promise<void> {
	return invoke(generateJarvisPluginCommand("unregister_extension_spawned_process"), {
		windowLabel,
		pid
	})
}

export function getExtLabelMap(): Promise<ExtensionLabelMap> {
	return invoke(generateJarvisPluginCommand("get_ext_label_map"))
}
