import * as path from "@tauri-apps/api/path"
import { exists, mkdir } from "@tauri-apps/plugin-fs"
import { constructPathApi as constructTauriPathApi } from "tauri-api-adapter"
import type { IPath } from "../client"

export async function constructExtensionSupportDir(extPath: string) {
	const appDataDir = await path.appDataDir()
	const extSupportDir = await path.join(
		appDataDir,
		"extensions_support",
		await path.basename(extPath)
	)
	if (extPath.startsWith(appDataDir)) {
		return extSupportDir
	} else {
		const extSupportDir = await path.join(extPath, "extensions_support")
		if (await exists(extSupportDir)) {
			return extSupportDir
		} else {
			await mkdir(extSupportDir, { recursive: true })
			return extSupportDir
		}
	}
}

/**
 * Return type omits BaseDirectory because it's only used on client side
 * @param extPath absolute path to the extension
 * @returns
 */
export function constructPathApi(extPath: string): Omit<IPath, "BaseDirectory"> {
	return {
		...constructTauriPathApi(),
		extensionDir: () => Promise.resolve(extPath),
		extensionSupportDir: () => constructExtensionSupportDir(extPath)
	}
}
