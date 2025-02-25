import type { Icon } from "@kksh/api/models"
import { createQuickLinkCommand, getAllQuickLinkCommands } from "@kksh/extension/db"
import type { QuickLink } from "@kksh/ui/types"
import { commandScore } from "@kksh/ui/utils"
import Fuse from "fuse.js"
import { derived, get, writable, type Writable } from "svelte/store"
import { appState } from "./appState"

export const fuse = new Fuse<QuickLink>([], {
	includeScore: true,
	threshold: 0.2,
	keys: ["name"]
})

export interface QuickLinkAPI {
	get: () => QuickLink[]
	init: () => Promise<void>
	refresh: () => Promise<void>
	createQuickLink: (name: string, link: string, icon: Icon) => Promise<void>
}

function createQuickLinksStore(): Writable<QuickLink[]> & QuickLinkAPI {
	const store = writable<QuickLink[]>([])

	async function init() {
		refresh()
	}

	async function refresh() {
		const cmds = await getAllQuickLinkCommands()
		const items = cmds.map((cmd) => ({ link: cmd.data.link, name: cmd.name, icon: cmd.data.icon }))
		store.set(items)
		fuse.setCollection(items)
	}

	async function createQuickLink(name: string, link: string, icon: Icon) {
		await createQuickLinkCommand(name, link, icon)
		await refresh()
	}

	return {
		...store,
		get: () => get(store),
		init,
		refresh,
		createQuickLink
	}
}

export const quickLinks = createQuickLinksStore()
export const quickLinksFiltered = derived([quickLinks, appState], ([$quickLinks, $appState]) => {
	return $appState.searchTerm
		? fuse.search($appState.searchTerm).map((result) => result.item)
		: $quickLinks
})
// export const quickLinksFiltered = derived([quickLinks, appState], ([$quicklinks, $appState]) => {
// 	return $quicklinks.filter((lnk) => {
// 		if ($appState.searchTerm.length === 0) {
// 			return false
// 		}
// 		return (
// 			commandScore(
// 				lnk.name,
// 				$appState.searchTerm
// 				// []
// 			) > 0.5
// 		)
// 	})
// })
