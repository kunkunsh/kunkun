import { Action as ActionSchema } from "@kksh/api/models"
import type { AppState } from "@kksh/types"
import { get, writable, type Writable } from "svelte/store"

export const defaultAppState: AppState = {
	searchTerm: "",
	highlightedCmd: "",
	loadingBar: false,
	defaultAction: "",
	actionPanel: undefined,
	lockHideOnBlur: false // when dialog is open, we don't hide the app, we lock the hide on blur and unlock when dialog is closed
}

interface AppStateAPI {
	clearSearchTerm: () => void
	get: () => AppState
	setLoadingBar: (loadingBar: boolean) => void
	setDefaultAction: (defaultAction: string | null) => void
	setActionPanel: (actionPanel?: ActionSchema.ActionPanel) => void
	setLockHideOnBlur: (lockHideOnBlur: boolean) => void
}

function createAppState(): Writable<AppState> & AppStateAPI {
	const store = writable<AppState>(defaultAppState)

	return {
		...store,
		get: () => get(store),
		clearSearchTerm: () => {
			store.update((state) => ({ ...state, searchTerm: "" }))
		},
		setLoadingBar: (loadingBar: boolean) => {
			store.update((state) => ({ ...state, loadingBar }))
		},
		setDefaultAction: (defaultAction: string | null) => {
			store.update((state) => ({ ...state, defaultAction }))
		},
		setActionPanel: (actionPanel?: ActionSchema.ActionPanel) => {
			store.update((state) => ({ ...state, actionPanel }))
		},
		setLockHideOnBlur: (lockHideOnBlur: boolean) => {
			store.update((state) => ({ ...state, lockHideOnBlur }))
		}
	}
}

export const appState = createAppState()
