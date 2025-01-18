import { get, writable, type Writable } from "svelte/store"

export interface KeyStoreAPI {
	get: () => string[]
	getSet: () => Set<string>
	keydown: (key: string) => void
	keyup: (key: string) => void
}

function createKeysStore(): Writable<string[]> & KeyStoreAPI {
	const store = writable<string[]>([])

	return {
		...store,
		get: () => get(store),
		getSet: () => new Set(get(store)),
		keydown: (key: string) => {
			store.update((state) => [...state, key])
		},
		keyup: (key: string) => {
			store.update((state) => state.filter((k) => k !== key))
		}
	}
}

export const keys = createKeysStore()
