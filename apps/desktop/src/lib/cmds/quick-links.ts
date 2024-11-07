import type { QuickLinkQuery } from "@/stores/quick-links"

/**
 * Given some link like https://google.com/search?q={argument}&query={query}
 * Find {argument} and {query}
 */
export function findAllArgsInLink(link: string): string[] {
	const regex = /\{([^}]+)\}/g
	const matches = [...link.matchAll(regex)]
	return matches.map((match) => match[1])
}

export function onQuickLinkSelect(cmd: QuickLinkQuery) {
	const args = findAllArgsInLink(cmd.value)
}
