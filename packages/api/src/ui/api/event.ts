import { proxy, type Remote } from "@huakunshen/comlink"
import type { DragDropPayload, DragEnterPayload, DragOverPayload, IEvent } from "../client"

// event API listens for events, event callback functions are proxied with comlink, thus I have to provide this constructor function
export function constructEventAPI(api: Remote<IEvent>): IEvent {
	return {
		onDragDrop: (callback: (payload: DragDropPayload) => void) => api.onDragDrop(proxy(callback)),
		onDragEnter: (callback: (payload: DragEnterPayload) => void) =>
			api.onDragEnter(proxy(callback)),
		onDragLeave: (callback: () => void) => api.onDragLeave(proxy(callback)),
		onDragOver: (callback: (payload: DragOverPayload) => void) => api.onDragOver(proxy(callback)),
		onWindowBlur: (callback: () => void) => api.onWindowBlur(proxy(callback)),
		onWindowCloseRequested: (callback: () => void) => api.onWindowCloseRequested(proxy(callback)),
		onWindowFocus: (callback: () => void) => api.onWindowFocus(proxy(callback))
		// onWindowThemeChanged: api.onWindowThemeChanged
	}
}
