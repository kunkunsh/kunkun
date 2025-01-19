import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// export function createSB(supabaseUrl: string, supabaseAnonKey: string) {
// 	return createClient<Database>(supabaseUrl, supabaseAnonKey, {
// 		auth: {
// 			flowType: "pkce"
// 		}
// 	})
// }
