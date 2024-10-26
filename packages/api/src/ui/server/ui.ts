import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow } from "@tauri-apps/api/window"
import type { IUiIframeServer1 } from "./server-types"

/**
 * Other APIs will be constructed in main window as they are used to manipulate UI directly
 * We can't access UI from here
 * @returns
 */
export function constructIframeUiApi(): IUiIframeServer1 {
	return {
		startDragging: () => {
			return getCurrentWindow().startDragging()
		},
		toggleMaximize: () => {
			return getCurrentWindow().toggleMaximize()
		},
		internalToggleMaximize: () => {
			return invoke<void>("plugin:window|internal_toggle_maximize")
		}
	}
}
