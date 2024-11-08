import { DEEP_LINK_PATH_REFRESH_DEV_EXTENSION } from "@kksh/api"
import {
	emit,
	emitTo,
	listen,
	TauriEvent,
	type Event,
	type EventCallback,
	type UnlistenFn
} from "@tauri-apps/api/event"

export const FileDragDrop = "tauri://drag-drop"
export const FileDragEnter = "tauri://drag-enter"
export const FileDragLeave = "tauri://drag-leave"
export const FileDragOver = "tauri://drag-over"
export const NewClipboardItemAddedEvent = "new_clipboard_item_added"
export const RefreshConfigEvent = "kunkun://refresh-config"
export const RefreshExtEvent = "kunkun://refresh-extensions"
export function listenToFileDrop(cb: EventCallback<{ paths: string[] }>) {
	return listen<{ paths: string[] }>(FileDragDrop, cb)
}

export function listenToWindowBlur(cb: EventCallback<null>) {
	return listen(TauriEvent.WINDOW_BLUR, cb)
}

export function listenToWindowFocus(cb: EventCallback<null>) {
	return listen(TauriEvent.WINDOW_FOCUS, cb)
}

export function listenToNewClipboardItem(cb: EventCallback<null>) {
	return listen(NewClipboardItemAddedEvent, cb)
}

export function emitRefreshConfig() {
	return emit(RefreshConfigEvent)
}

export function listenToRefreshConfig(cb: EventCallback<null>) {
	return listen(RefreshConfigEvent, cb)
}

export function emitRefreshExt() {
	return emitTo("main", RefreshExtEvent)
}

export function listenToRefreshExt(cb: EventCallback<null>) {
	return listen(RefreshExtEvent, cb)
}

export function emitRefreshDevExt() {
	return emit(DEEP_LINK_PATH_REFRESH_DEV_EXTENSION)
}

export function listenToRefreshDevExt(cb: EventCallback<null>) {
	return listen(DEEP_LINK_PATH_REFRESH_DEV_EXTENSION, cb)
}
