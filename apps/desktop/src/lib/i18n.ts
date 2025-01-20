// file initialized by the Paraglide-SvelteKit CLI - Feel free to edit it
import { createI18n } from "@inlang/paraglide-sveltekit"
import { goto } from "$app/navigation"
import { page } from "$app/state"
import * as runtime from "$lib/paraglide/runtime.js"
import { tick } from "svelte"

export const i18n = createI18n(runtime)

export function switchToLanguage(newLanguage: runtime.AvailableLanguageTag) {
	runtime.setLanguageTag(newLanguage)
	const canonicalPath = i18n.route(page.url.pathname)
	const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage)
	tick().then(() => {
		goto(localisedPath)
	})
}
