import { emitTo, listen, type EventCallback, type UnlistenFn } from "@tauri-apps/api/event"

/* ------------------------------- Event Names ------------------------------ */
export const RECORD_EXTENSION_PROCESS_EVENT = "record-extension-process"
export interface IRecordExtensionProcessEvent {
	windowLabel: string
	pid: number
}

/**
 * listen to RECORD_EXTENSION_PROCESS_EVENT
 * This event is emitted when an extension spawns a process. Processes won't be cleaned up automatically
 * Extensions should clean up the processes when extension quits, but there is no way to guarantee this.
 * So we need to record the processes spawned from extensions and clean up the processes when extension quits.
 * @param callback
 * @returns
 */
export function listenToRecordExtensionProcessEvent(
	callback: EventCallback<IRecordExtensionProcessEvent>
): Promise<UnlistenFn> {
	return listen<IRecordExtensionProcessEvent>(RECORD_EXTENSION_PROCESS_EVENT, callback)
}

export const KILL_PROCESS_EVENT = "kunkun://kill-process"
export function emitKillProcessEvent(pid: number) {
	return emitTo("main", KILL_PROCESS_EVENT, { pid })
}

export function listenToKillProcessEvent(cb: EventCallback<{ pid: number }>) {
	return listen<{ pid: number }>(KILL_PROCESS_EVENT, cb)
}
