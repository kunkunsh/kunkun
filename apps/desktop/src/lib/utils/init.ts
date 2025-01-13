import { getCurrentWindow } from "@tauri-apps/api/window"
import { dev } from "$app/environment"

/**
 * Initialize the app
 */
export function init() {
	const window = getCurrentWindow()
	if (window.label === "main") {
		initMainWindow()
	}

	if (!dev) {
		document.addEventListener("contextmenu", function (event) {
			event.preventDefault()
			console.warn("contextmenu disabled in release mode", event)
		})
	}
}

export function initMainWindow() {
	// const window = getCurrentWindow()
	// if (window.label === "main") {
	// 	window.onCloseRequested((event) => {
	// 		event.preventDefault()
	// 		window.hide()
	// 	})
	// }
}
