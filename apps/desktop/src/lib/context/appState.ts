import type { AppState } from '@/types/appState';
import { getContext, setContext } from 'svelte'
import type { Writable } from 'svelte/store';

export const APP_STATE_CONTEXT_KEY = Symbol('appState')

export function getAppStateContext(): Writable<AppState> {
	return getContext(APP_STATE_CONTEXT_KEY)
}

export function setAppStateContext(appState: Writable<AppState>) {
	setContext(APP_STATE_CONTEXT_KEY, appState)
}
