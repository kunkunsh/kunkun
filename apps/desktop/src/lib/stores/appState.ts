import { findAllArgsInLink } from "@/cmds/quick-links"
import { Action as ActionSchema, CmdTypeEnum } from "@kksh/api/models"
import type { AppState } from "@kksh/types"
import type { CmdValue } from "@kksh/ui/types"
import { derived, get, writable, type Writable } from "svelte/store"

export const defaultAppState: AppState = {
	searchTerm: "",
	highlightedCmd: "",
	loadingBar: false,
	defaultAction: "",
	actionPanel: undefined
}

interface AppStateAPI {
	clearSearchTerm: () => void
	get: () => AppState
	setLoadingBar: (loadingBar: boolean) => void
	setDefaultAction: (defaultAction: string) => void
	setActionPanel: (actionPanel?: ActionSchema.ActionPanel) => void
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
		setDefaultAction: (defaultAction: string) => {
			store.update((state) => ({ ...state, defaultAction }))
		},
		setActionPanel: (actionPanel?: ActionSchema.ActionPanel) => {
			store.update((state) => ({ ...state, actionPanel }))
		}
	}
}

export const appState = createAppState()
