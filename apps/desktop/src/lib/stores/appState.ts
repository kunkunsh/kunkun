import { findAllArgsInLink } from "@/cmds/quick-links"
import { CmdTypeEnum } from "@kksh/api/models"
import type { AppState } from "@kksh/types"
import type { CmdValue } from "@kksh/ui/types"
import { derived, get, writable, type Writable } from "svelte/store"

export const defaultAppState: AppState = {
	searchTerm: "",
	highlightedCmd: "",
	loadingBar: false
}

interface AppStateAPI {
	clearSearchTerm: () => void
	get: () => AppState
	setLoadingBar: (loadingBar: boolean) => void
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
		}
	}
}

export const appState = createAppState()

// export const cmdQueries = derived(appState, ($appState) => {
// 	if ($appState.highlightedCmd.startsWith("{")) {
// 		const parsedCmd = JSON.parse($appState.highlightedCmd) as CmdValue
// 		if (parsedCmd.cmdType === CmdTypeEnum.QuickLink && parsedCmd.data) {
// 			return findAllArgsInLink(parsedCmd.data).map((arg) => ({ name: arg, value: "" }))
// 		}
// 	}
// 	return []
// })
