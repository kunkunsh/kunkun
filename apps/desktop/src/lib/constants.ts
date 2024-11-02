import { appIsDev } from "@kksh/api/commands"
import { appDataDir, join } from "@tauri-apps/api/path"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_PROJECT_ID } from "$env/static/public"

export const SUPABASE_ANON_KEY = PUBLIC_SUPABASE_ANON_KEY
export const SUPABASE_URL = `https://${PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`
export const SUPABASE_GRAPHQL_ENDPOINT = `${SUPABASE_URL}/graphql/v1`
export function getExtensionsFolder() {
	return appDataDir().then((appDataDirPath) => join(appDataDirPath, "extensions"))
}
export const IS_IN_TAURI =
	typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__ !== undefined
