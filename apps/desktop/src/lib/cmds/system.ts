import { getSystemCommands } from "@kksh/api/commands"
import type { SysCommand } from "@kksh/api/models"
import { commandScore } from "@kksh/ui/utils"
import Fuse from "fuse.js"
import { derived, readable } from "svelte/store"
import { appState } from "../stores/appState"

export const systemCommands = getSystemCommands()

export const fuse = new Fuse<SysCommand>(systemCommands, {
	includeScore: true,
	threshold: 0.2,
	keys: ["name"]
})

export const systemCommandsFiltered = derived(appState, ($appState) => {
	return $appState.searchTerm
		? fuse.search($appState.searchTerm).map((result) => result.item)
		: systemCommands
})

// export const systemCommandsFiltered = derived(
// 	[systemCommands, appState],
// 	([$systemCommands, $appState]) => {
// 		return $systemCommands.filter((cmd) => commandScore(cmd.name, $appState.searchTerm) > 0.5)
// 	}
// )
