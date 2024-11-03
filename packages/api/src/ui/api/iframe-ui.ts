import type { Remote } from "@huakunshen/comlink"
import type { IOs } from "tauri-api-adapter/client"
import { type IUiIframe } from "../client"

export const KK_DRAG_REGION_ATTR = "data-kunkun-drag-region"

export function constructIframeUiAPI(api: {
	iframeUi: Remote<IUiIframe>
	os: Remote<IOs>
}): IUiIframe {
	return {
		goBack: api.iframeUi.goBack,
		hideBackButton: api.iframeUi.hideBackButton,
		hideMoveButton: api.iframeUi.hideMoveButton,
		hideRefreshButton: api.iframeUi.hideRefreshButton,
		showBackButton: api.iframeUi.showBackButton,
		showMoveButton: api.iframeUi.showMoveButton,
		showRefreshButton: api.iframeUi.showRefreshButton,
		getTheme: api.iframeUi.getTheme,
		reloadPage: api.iframeUi.reloadPage,
		toggleMaximize: api.iframeUi.toggleMaximize,
		startDragging: api.iframeUi.startDragging,
		internalToggleMaximize: api.iframeUi.internalToggleMaximize,
		setTransparentWindowBackground: api.iframeUi.setTransparentWindowBackground,
		/**
		 * https://github.com/tauri-apps/tauri/blob/e1776946ad034d7a6e005834a754773671d9f7ef/core/tauri/src/window/scripts/drag.js#L13
		 */
		registerDragRegion: async (): Promise<void> => {
			const osName = await api.os.platform()
			let x = 0
			let y = 0

			document.addEventListener("mousedown", (e) => {
				const target = e.target as HTMLElement
				if (
					// element has the magic data attribute
					(target.classList.contains(KK_DRAG_REGION_ATTR) ||
						target.hasAttribute(KK_DRAG_REGION_ATTR)) &&
					// and was left mouse button
					e.button === 0 &&
					// and was normal click to drag or double click to maximize
					(e.detail === 1 || e.detail === 2)
				) {
					// macOS maximization happens on `mouseup`,
					// so we save needed state and early return
					if (osName === "macos" && e.detail == 2) {
						x = e.clientX
						y = e.clientY
						return
					}

					// prevents text cursor
					e.preventDefault()

					// fix #2549: double click on drag region edge causes content to maximize without window sizing change
					// https://github.com/tauri-apps/tauri/issues/2549#issuecomment-1250036908
					e.stopImmediatePropagation()

					// start dragging if the element has a `tauri-drag-region` data attribute and maximize on double-clicking it
					// const cmd = e.detail === 2 ? "internal_toggle_maximize" : "start_dragging"
					if (e.detail === 2) {
						api.iframeUi.internalToggleMaximize()
					} else {
						api.iframeUi.startDragging()
					}
					// window.__TAURI_INTERNALS__.invoke("plugin:window|" + cmd)
				}
			})

			if (osName === "macos") {
				document.addEventListener("mouseup", (e) => {
					const target = e.target as HTMLElement
					if (
						// element has the magic data attribute
						(target.classList.contains(KK_DRAG_REGION_ATTR) ||
							target.hasAttribute(KK_DRAG_REGION_ATTR)) &&
						// target.hasAttribute(KK_DRAG_REGION_ATTR) &&
						// and was left mouse button
						e.button === 0 &&
						// and was double click
						e.detail === 2 &&
						// and the cursor hasn't moved from initial mousedown
						e.clientX === x &&
						e.clientY === y
					) {
						// window.__TAURI_INTERNALS__.invoke("plugin:window|internal_toggle_maximize")
						api.iframeUi.internalToggleMaximize()
					}
				})
			}
		}
	}
}
