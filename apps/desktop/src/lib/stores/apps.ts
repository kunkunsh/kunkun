import { getAllApps, refreshApplicationsList } from "@kksh/api/commands"
import { AppInfo } from "@kksh/api/models"
import { get, writable, type Writable } from "svelte/store"

export function createAppsLoaderStore() {
	const store = writable<AppInfo[]>([])

	return {
		...store,
		get: () => get(store),
		init: async () => {
			await refreshApplicationsList()
			const apps = await getAllApps()
			store.set(apps)
		}
	}
}

export const appsLoader = createAppsLoaderStore()
