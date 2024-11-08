import type { Icon } from "@kksh/api/models"
import { createQuickLinkCommand, getAllQuickLinkCommands } from "@kksh/extension/db"
import type { CmdQuery, QuickLink } from "@kksh/ui/types"
import { get, writable, type Writable } from "svelte/store"

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
		store.set(cmds.map((cmd) => ({ link: cmd.data.link, name: cmd.name, icon: cmd.data.icon })))
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
