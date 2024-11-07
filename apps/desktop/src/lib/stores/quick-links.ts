import { createQuickLinkCommand, getAllQuickLinkCommands } from "@kksh/extension/db"
import { get, writable, type Writable } from "svelte/store"

export type QuickLinkQuery = {
	value: string
	name: string
}

export interface QuickLinkAPI {
	get: () => QuickLinkQuery[]
	init: () => Promise<void>
	refresh: () => Promise<void>
	createQuickLink: (name: string, link: string) => Promise<void>
}

function createQuickLinksStore(): Writable<QuickLinkQuery[]> & QuickLinkAPI {
	const store = writable<QuickLinkQuery[]>([])

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
