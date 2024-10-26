/**
 * `tauri-api-adapter` contains a `constructEventApi()`.
 * We don't use that one because it exposes raw `listen()` and `emit()`, which may expose too much power to the client.
 * Instead in this project, we define a custom `IEventServer` interface and `constructEventApi()` function that
 * only exposes a limited set of events.
 */
import { listen, TauriEvent } from "@tauri-apps/api/event"
import { type EventPermission } from "../../permissions"
import { EventPermissionMap } from "../../permissions/permission-map"
import { checkPermission } from "../../utils/permission-check"
import type { DragDropPayload, DragEnterPayload, DragOverPayload, IEvent } from "../client"

export function constructEventApi(permissions: EventPermission[]): IEvent {
	return {
		onDragDrop: (callback) => {
			checkPermission<EventPermission>(permissions, EventPermissionMap.onDragDrop)
			listen<DragDropPayload>(TauriEvent.DRAG_DROP, (e) => {
				callback(e.payload)
			})
		},
		onDragEnter: (callback) => {
			checkPermission<EventPermission>(permissions, EventPermissionMap.onDragEnter)
			listen<DragEnterPayload>(TauriEvent.DRAG_ENTER, (e) => {
				callback(e.payload)
			})
		},
		onDragLeave: (callback) => {
			checkPermission<EventPermission>(permissions, EventPermissionMap.onDragLeave)
			listen<null>(TauriEvent.DRAG_LEAVE, (e) => {
				callback()
			})
		},
		onDragOver: (callback) => {
			checkPermission<EventPermission>(permissions, EventPermissionMap.onDragOver)
			listen<DragOverPayload>(TauriEvent.DRAG_OVER, (e) => {
				callback(e.payload)
			})
		},
		onWindowBlur: (callback) => {
			checkPermission<EventPermission>(permissions, EventPermissionMap.onWindowBlur)
			listen<null>(TauriEvent.WINDOW_BLUR, (e) => {
				callback()
			})
		},
		onWindowCloseRequested: (callback) => {
			checkPermission<EventPermission>(permissions, EventPermissionMap.onWindowCloseRequested)
			listen<null>(TauriEvent.WINDOW_CLOSE_REQUESTED, (e) => {
				callback()
			})
		},
		onWindowFocus: (callback) => {
			checkPermission<EventPermission>(permissions, EventPermissionMap.onWindowFocus)
			listen<null>(TauriEvent.WINDOW_FOCUS, (e) => {
				callback()
			})
		}
	}
}
