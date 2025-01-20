import { i18n } from "@/i18n"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { goto } from "$app/navigation"
import { isInMainWindow } from "./window"

export function goBack() {
	window.history.back()
}

export function goHome() {
	goto(i18n.resolveRoute("/app/"))
}

export function goHomeOrCloseDependingOnWindow() {
	if (isInMainWindow()) {
		goHome()
	} else {
		getCurrentWindow().close()
	}
}
