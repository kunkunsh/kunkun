import { createClient } from "@supabase/supabase-js"
import { type Database } from "./types/database.types"

export function createSB(supabaseUrl: string, supabaseAnonKey: string) {
	return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
export { SupabaseAPI } from "./api"

export type { Database, Tables } from "./types/database.types"
export { ExtItem } from "./model"
