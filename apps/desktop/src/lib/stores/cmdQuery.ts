import { findAllArgsInLink } from "@/cmds/quick-links"
import { CmdTypeEnum } from "@kksh/api/models"
import type { CmdQuery, CmdValue } from "@kksh/ui/main"
import { derived, get, writable, type Writable } from "svelte/store"
import { appState } from "./appState"

function createCmdQueryStore(): Writable<CmdQuery[]> {
	const store = writable<CmdQuery[]>([])
	appState.subscribe(($appState) => {
		if ($appState.highlightedCmd.startsWith("{")) {
			const parsedCmd = JSON.parse($appState.highlightedCmd) as CmdValue
			if (parsedCmd.cmdType === CmdTypeEnum.QuickLink && parsedCmd.data) {
				return store.set(findAllArgsInLink(parsedCmd.data).map((arg) => ({ name: arg, value: "" })))
			}
		}
		store.set([])
	})
	return {
		...store
	}
}

export const cmdQueries = createCmdQueryStore()

// export const cmdQueries = derived(appState, ($appState) => {
// 	console.log($appState.highlightedCmd)
// 	if ($appState.highlightedCmd.startsWith("{")) {
// 		const parsedCmd = JSON.parse($appState.highlightedCmd) as CmdValue
// 		if (parsedCmd.cmdType === CmdTypeEnum.QuickLink && parsedCmd.data) {
// 			return findAllArgsInLink(parsedCmd.data)
// 		}
// 	}
// 	return []
// })
