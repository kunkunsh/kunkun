import { getExtensionsFolder, IS_IN_TAURI } from "@/constants"
import * as path from "@tauri-apps/api/path"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import { error } from "@tauri-apps/plugin-log"
import { setStoreCollectionPath } from "@tauri-store/svelte"
import type { LayoutLoad } from "./$types"

export const load: LayoutLoad = async () => {
	const appDataPath = await path.appDataDir()
	await setStoreCollectionPath(await path.join(appDataPath, "kk-config"))
	const win = getCurrentWebviewWindow()
	return { extsInstallDir: IS_IN_TAURI ? await getExtensionsFolder() : "", appDataPath, win }
}
