import { goto } from "$app/navigation"

export function goBack() {
	window.history.back()
}

export function goHome() {
	goto("/")
}
