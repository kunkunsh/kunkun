import { appState } from "@/stores"
import type { CmdQuery, CmdValue } from "@kksh/ui/types"
import { open } from "tauri-plugin-shellx-api"

/**
 * Given some link like https://google.com/search?q={argument}&query={query}
 * Find {argument} and {query}
 */
export function findAllArgsInLink(link: string): string[] {
	const regex = /\{([^}]+)\}/g
	const matches = [...link.matchAll(regex)]
	return matches.map((match) => match[1])
}

export function onQuickLinkSelect(quickLink: CmdValue, queries: CmdQuery[]) {
	console.log(quickLink, queries)
	let qlink = quickLink.data
	for (const arg of queries) {
		console.log(`replace all {${arg.name}} with ${arg.value}`)
		qlink = qlink.replaceAll(`{${arg.name}}`, arg.value)
	}
	appState.clearSearchTerm()
	console.log(qlink)
	open(qlink)
}
