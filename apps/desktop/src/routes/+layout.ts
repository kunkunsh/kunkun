import { getExtensionsFolder, IS_IN_TAURI } from "@/constants"
import { error } from "@tauri-apps/plugin-log"
import type { LayoutLoad } from "./$types"

// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true
export const ssr = false

export const load: LayoutLoad = async () => {
	return { extsInstallDir: IS_IN_TAURI ? await getExtensionsFolder() : "" }
}
