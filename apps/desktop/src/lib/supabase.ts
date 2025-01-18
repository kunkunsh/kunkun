import { SupabaseAPI } from "@kksh/supabase/api"
import type { Database } from "@kksh/supabase/types"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./constants"

// export const supabase = createSB(SUPABASE_URL, SUPABASE_ANON_KEY)
export const supabase: SupabaseClient<Database> = createClient<Database>(
	SUPABASE_URL,
	SUPABASE_ANON_KEY,
	{
		auth: {
			flowType: "pkce"
		}
	}
)

export const storage = supabase.storage
export const supabaseExtensionsStorage = supabase.storage.from("extensions")
export const supabaseAPI = new SupabaseAPI(supabase)
