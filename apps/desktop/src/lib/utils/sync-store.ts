import * as evt from "@tauri-apps/api/event"
import { writable, type Writable } from "svelte/store"

export function buildEventName(storeName: string) {
	return `app://sync-store-${storeName}`
}

export type WithSyncStore<T> = Writable<T> & {
	listen: () => void
	unlisten: evt.UnlistenFn | undefined
}

export function createTauriSyncStore<T>(storeName: string, initialValue: T): WithSyncStore<T> {
	const store = writable<T>(initialValue)
	let unlisten: evt.UnlistenFn | undefined

	async function listen() {
		console.log("[listen] start", storeName)
		if (unlisten) {
			console.log("[listen] already listening, skip")
			return
		}
		const _unlisten = await evt.listen<{ value: T }>(buildEventName(storeName), (evt) => {
			console.log(`[listen] update from tauri event`, storeName, evt.payload.value)
			store.set(evt.payload.value)
		})
		const unsubscribe = store.subscribe((value) => {
			console.log("[subscribe] got update, emit data", storeName, value)
			evt.emit(buildEventName(storeName), { value })
		})
		unlisten = () => {
			_unlisten()
			unsubscribe()
			unlisten = undefined
		}
		return unlisten
	}

	return {
		...store,
		listen,
		unlisten
	}
}
