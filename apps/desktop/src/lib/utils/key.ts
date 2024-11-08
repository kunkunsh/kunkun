import { appState } from "@/stores"
import { goto } from "$app/navigation"
import { goBack, goHome } from "./route"

export function goHomeOnEscape(e: KeyboardEvent) {
	if (e.key === "Escape") {
		goHome()
	}
}

export function goBackOnEscape(e: KeyboardEvent) {
	if (e.key === "Escape") {
		goBack()
	}
}

export function goBackOnEscapeClearSearchTerm(e: KeyboardEvent) {
	if (e.key === "Escape") {
		if (appState.get().searchTerm) {
			appState.clearSearchTerm()
		} else {
			goBack()
		}
	}
}

export function goHomeOnEscapeClearSearchTerm(e: KeyboardEvent) {
	if (e.key === "Escape") {
		if (appState.get().searchTerm) {
			appState.clearSearchTerm()
		} else {
			goHome()
		}
	}
}
