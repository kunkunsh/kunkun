import { getAllApps, refreshApplicationsList } from "@kksh/api/commands"
import { AppInfo } from "@kksh/api/models"
import { commandScore } from "@kksh/ui/utils"
import * as fs from "@tauri-apps/plugin-fs"
import { platform } from "@tauri-apps/plugin-os"
import { derived, get, writable } from "svelte/store"
import { appState } from "./appState"

export function createAppsLoaderStore() {
	const store = writable<AppInfo[]>([])

	return {
		...store,
		get: () => get(store),
		init: async () => {
			await refreshApplicationsList()
			let apps = await getAllApps()
			if (platform() === "macos") {
				apps = apps.filter((app) => {
					return (
						!app.app_desktop_path.includes("Parallels") &&
						!app.app_desktop_path.startsWith("/Library/Application Support") &&
						!app.app_desktop_path.startsWith("/System/Library/CoreServices") &&
						!app.app_desktop_path.startsWith("/System/Library/PrivateFrameworks")
					)
				})
			}
			// console.log("filteredApps", apps)
			// fs.writeTextFile("/Users/hk/Desktop/apps.json", JSON.stringify(apps))
			store.set(apps)
		}
	}
}

export const appsLoader = createAppsLoaderStore()

// export const appsFiltered = derived([appsLoader, appState], ([$apps, $appState]) => {
// 	return []
// 	return $apps.filter((app) => {
// 		if ($appState.searchTerm.length === 0) {
// 			return false
// 		}
// 		return (
// 			commandScore(
// 				app.name,
// 				$appState.searchTerm
// 				// []
// 			) > 0.8
// 		)
// 	})
// })
