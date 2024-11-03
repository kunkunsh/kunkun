import { Icon } from "@kksh/api/models"
import { createSB, ExtItem, SupabaseAPI, type Tables } from "@kksh/supabase"
import { createClient, type PostgrestSingleResponse } from "@supabase/supabase-js"
import * as v from "valibot"
import { number, object, optional, pipe, string, transform, type InferOutput } from "valibot"
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./constants"

export const supabase = createSB(SUPABASE_URL, SUPABASE_ANON_KEY)
export const storage = supabase.storage
export const supabaseExtensionsStorage = supabase.storage.from("extensions")
export const supabaseAPI = new SupabaseAPI(supabase)
