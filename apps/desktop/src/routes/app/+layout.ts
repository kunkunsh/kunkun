import { getExtensionsFolder, IS_IN_TAURI } from "@/constants"
import { error } from "@tauri-apps/plugin-log"
import type { LayoutLoad } from "./$types"

export const load: LayoutLoad = async () => {
	return { extsInstallDir: IS_IN_TAURI ? await getExtensionsFolder() : "" }
}
