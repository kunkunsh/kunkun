import type { AppState } from "@/types"
import { get, writable, type Writable } from "svelte/store"

export const defaultAppState: AppState = {
	searchTerm: "",
	highlightedCmd: ""
}

interface AppStateAPI {
	clearSearchTerm: () => void
	get: () => AppState
}

function createAppState(): Writable<AppState> & AppStateAPI {
	const store = writable<AppState>(defaultAppState)

	return {
		subscribe: store.subscribe,
		update: store.update,
		set: store.set,
		get: () => get(store),
		clearSearchTerm: () => {
			store.update((state) => ({ ...state, searchTerm: "" }))
		}
	}
}

export const appState = createAppState()
