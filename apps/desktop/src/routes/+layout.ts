import { getExtensionsFolder } from "@/constants"
import type { LayoutLoad } from "./$types"
import "virtual:uno.css"

// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true
export const ssr = false

export const load: LayoutLoad = async () => {
	return { extsInstallDir: await getExtensionsFolder() }
}
