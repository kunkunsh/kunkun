import { getExtensionsFolder, IS_IN_TAURI } from "@/constants"
import { error } from "@tauri-apps/plugin-log"
import type { LayoutLoad } from "./$types"
import { setStoreCollectionPath } from '@tauri-store/svelte';
import * as path from "@tauri-apps/api/path";

export const load: LayoutLoad = async () => {
	const appDataPath = await path.appDataDir()
	await setStoreCollectionPath(await path.join(appDataPath, "kk-config"))
	return { extsInstallDir: IS_IN_TAURI ? await getExtensionsFolder() : "", appDataPath }
}
