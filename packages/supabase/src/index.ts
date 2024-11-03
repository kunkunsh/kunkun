import type { Database } from "@kksh/api/supabase/types"
import { createClient } from "@supabase/supabase-js"

export function createSB(supabaseUrl: string, supabaseAnonKey: string) {
	return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
export { SupabaseAPI } from "./api"

export type { Database, Tables } from "@kksh/api/supabase/types"
export { SBExt } from "@kksh/api/supabase"
