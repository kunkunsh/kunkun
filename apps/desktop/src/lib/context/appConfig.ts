/**
 * This is app state context.
 * It's designed to allow all components to access a shared state.
 * With context, we can avoid prop drilling, and avoid using stores which makes components hard to encapsulate.
 */
import type { AppConfig } from "@/types/appConfig"
import { getContext, setContext } from "svelte"
import type { Writable } from "svelte/store"

export const APP_CONFIG_CONTEXT_KEY = Symbol("appConfig")

export function getAppConfigContext(): Writable<AppConfig> {
	return getContext(APP_CONFIG_CONTEXT_KEY)
}

export function setAppConfigContext(appConfig: Writable<AppConfig>) {
	setContext(APP_CONFIG_CONTEXT_KEY, appConfig)
}
