import { getCurrentWindow } from "@tauri-apps/api/window"

export function isInMainWindow() {
	return getCurrentWindow().label == "main"
}
