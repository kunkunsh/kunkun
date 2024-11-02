import { invoke } from "@tauri-apps/api/core"
import { appDataDir, join } from "@tauri-apps/api/path"
import { generateJarvisPluginCommand } from "./common"

export function startServer(): Promise<void> {
	return invoke(generateJarvisPluginCommand("start_server"))
}

export function stopServer(): Promise<void> {
	return invoke(generateJarvisPluginCommand("stop_server"))
}

export function restartServer(): Promise<void> {
	return invoke(generateJarvisPluginCommand("restart_server"))
}

export function serverIsRunning(): Promise<boolean> {
	return invoke(generateJarvisPluginCommand("server_is_running"))
}

// TODO: clean this up
// export function setDevExtensionFolder(devExtFolder: string | null): Promise<void> {
// 	return invoke(generateJarvisPluginCommand("set_dev_extension_folder"), { devExtFolder })
// }

// export function setExtensionFolder(extFolder: string | null): Promise<void> {
// 	return invoke(generateJarvisPluginCommand("set_extension_folder"), { extFolder })
// }

// export function getExtensionFolder(): Promise<string | null> {
// return invoke(generateJarvisPluginCommand("get_extension_folder"))
// 	return appDataDir().then((dir) => join(dir, "extensions"))
// }

// export function getDevExtensionFolder(): Promise<string | null> {
// return invoke(generateJarvisPluginCommand("get_dev_extension_folder"))
// }

export function getServerPort() {
	return invoke<number>(generateJarvisPluginCommand("get_server_port"))
}
