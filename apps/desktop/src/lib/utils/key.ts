import { appState } from "@/stores"
import { toggleDevTools } from "@kksh/api/commands"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { platform } from "@tauri-apps/plugin-os"
import { goto } from "$app/navigation"
import { isKeyboardEventFromInputElement } from "./dom"
import { modifierKeySet } from "./js"
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

export async function globalKeyDownHandler(e: KeyboardEvent) {
	const _platform = platform()
	if ((_platform === "macos" && e.metaKey) || (_platform === "windows" && e.ctrlKey)) {
		if (e.key === ",") {
			e.preventDefault()
			goto("/settings")
		}
	}
	// Toggle Devtools with control + shift + I
	if (e.ctrlKey && e.shiftKey && e.key === "I") {
		e.preventDefault()
		toggleDevTools()
	}
	// Reload window with control + shift + R
	if (e.ctrlKey && e.shiftKey && e.key === "R") {
		e.preventDefault()
		const appWin = getCurrentWebviewWindow()
		await appWin.hide()
		location.reload()
		setTimeout(() => {
			appWin.show()
		}, 1_000)
	}
}

export function isLetter(letter: string): boolean {
	if (letter.length != 1) return false
	return letter.match(/[a-zA-Z]/) ? true : false
}

export function isShortcut(letters: string[]): boolean {
	// letters contain at least one modifier key and one non-modifier key

	let hasModifier = false
	let hasNonModifier = false

	for (let letter of letters) {
		if (modifierKeySet.has(letter)) {
			hasModifier = true
		} else {
			hasNonModifier = true
		}
	}

	return hasModifier && hasNonModifier
}
