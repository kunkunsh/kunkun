import { browser } from "$app/environment"

// @ts-expect-error window.__TAURI_INTERNALS__ is not defined in the browser
export const isInTauri = browser ? !!window.__TAURI_INTERNALS__ : false