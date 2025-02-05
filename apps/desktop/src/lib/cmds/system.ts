import { getSystemCommands } from "@kksh/api/commands"
import type { SysCommand } from "@kksh/api/models"
import { commandScore } from "@kksh/ui/utils"
import { derived, readable } from "svelte/store"
import { appState } from "../stores/appState"

export const systemCommands = readable(getSystemCommands())

// export const systemCommandsFiltered = derived(
// 	[systemCommands, appState],
// 	([$systemCommands, $appState]) => {
// 		return $systemCommands.filter((cmd) => commandScore(cmd.name, $appState.searchTerm) > 0.5)
// 	}
// )
