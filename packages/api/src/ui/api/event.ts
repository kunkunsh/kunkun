// import { proxy, type Remote } from "@huakunshen/comlink"
import type { DragDropPayload, DragEnterPayload, DragOverPayload, IEvent } from "../client"

// event API listens for events, event callback functions are proxied with comlink, thus I have to provide this constructor function
export function constructEventAPI(api: IEvent): IEvent {
	return {
		onDragDrop: (callback: (payload: DragDropPayload) => void) => api.onDragDrop(callback),
		onDragEnter: (callback: (payload: DragEnterPayload) => void) => api.onDragEnter(callback),
		onDragLeave: (callback: () => void) => api.onDragLeave(callback),
		onDragOver: (callback: (payload: DragOverPayload) => void) => api.onDragOver(callback),
		onWindowBlur: (callback: () => void) => api.onWindowBlur(callback),
		onWindowCloseRequested: (callback: () => void) => api.onWindowCloseRequested(callback),
		onWindowFocus: (callback: () => void) => api.onWindowFocus(callback)
		// onWindowThemeChanged: api.onWindowThemeChanged
	}
}
