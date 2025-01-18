import { writeFileSync } from "fs"
import { type Database } from "@kksh/supabase/types"
import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
	throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
}

const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const { data, error } = await supabase.storage.from("pub").download("server_public_key.pem")
if (error) {
	console.error(error)
	throw error
}

writeFileSync("./keys/server_public_key.pem", await data.text())
