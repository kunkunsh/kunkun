import { appState } from "@/stores"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { platform } from "@tauri-apps/plugin-os"
import { goto } from "$app/navigation"
import { isKeyboardEventFromInputElement } from "./dom"
import { goBack, goHome, goHomeOrCloseDependingOnWindow } from "./route"
import { isInMainWindow } from "./window"

export function goHomeOnEscape(e: KeyboardEvent) {
	console.log("goHomeOnEscape", e.key)
	if (e.key === "Escape") {
		goHome()
	}
}

export function goBackOnEscape(e: KeyboardEvent) {
	console.log("goBackOnEscape", e.key)
	if (e.key === "Escape") {
		goBack()
	}
}

export function goBackOnEscapeClearSearchTerm(e: KeyboardEvent) {
	console.log("goBackOnEscapeClearSearchTerm", e.key)
	if (e.key === "Escape") {
		if (appState.get().searchTerm) {
			appState.clearSearchTerm()
		} else {
			goBack()
		}
	}
}

export function goHomeOnEscapeClearSearchTerm(e: KeyboardEvent) {
	console.log("goHomeOnEscapeClearSearchTerm", e.key)
	if (e.key === "Escape") {
		if (appState.get().searchTerm) {
			appState.clearSearchTerm()
		} else {
			goHome()
		}
	}
}

export function goBackOrCloseOnEscape(e: KeyboardEvent) {
	console.log("goBackOrCloseOnEscape", e.key)
	if (e.key === "Escape") {
		if (isInMainWindow()) {
			goBack()
		} else {
			getCurrentWindow().close()
		}
	}
}

export function goHomeOrCloseOnEscapeWithInput(e: KeyboardEvent) {
	if (e.key === "Escape") {
		if (isKeyboardEventFromInputElement(e)) {
			const target = e.target as HTMLInputElement
			if (target.value === "") {
				goHomeOrCloseDependingOnWindow()
			} else {
				target.value = ""
			}
		} else {
			goHomeOrCloseDependingOnWindow()
		}
	}
}

export function globalKeyDownHandler(e: KeyboardEvent) {
	console.log("globalKeyDownHandler", e.key)
	const _platform = platform()
	if ((_platform === "macos" && e.metaKey) || (_platform === "windows" && e.ctrlKey)) {
		if (e.key === ",") {
			e.preventDefault()
			goto("/settings")
		}
	}
}
