import { createQuickLinkCommand, getAllQuickLinkCommands } from "@kksh/extension/db"
import type { CmdQuery } from "@kksh/ui/types"
import { get, writable, type Writable } from "svelte/store"

export interface QuickLinkAPI {
	get: () => CmdQuery[]
	init: () => Promise<void>
	refresh: () => Promise<void>
	createQuickLink: (name: string, link: string) => Promise<void>
}

function createQuickLinksStore(): Writable<CmdQuery[]> & QuickLinkAPI {
	const store = writable<CmdQuery[]>([])

	async function init() {
		refresh()
	}

	async function refresh() {
		const cmds = await getAllQuickLinkCommands()
		store.set(cmds.map((cmd) => ({ value: cmd.data, name: cmd.name })))
	}

	async function createQuickLink(name: string, link: string) {
		await createQuickLinkCommand(name, link)
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
