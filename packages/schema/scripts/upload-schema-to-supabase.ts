import { ExtPackageJson } from "@kksh/api/models"
import { createSB } from "@kksh/supabase"
import { parse, string } from "valibot"
import * as v from "valibot"
import { getJsonSchema } from "../src"

const supabase = createSB(
	parse(string(), process.env.SUPABASE_URL),
	parse(string(), process.env.SUPABASE_SERVICE_ROLE_KEY)
)

const schemaStr = getJsonSchema(ExtPackageJson)

const { data, error } = await supabase.storage.from("extensions").upload("schema.json", schemaStr, {
	cacheControl: "3600",
	upsert: true // overwrite existing file with same name
})
await supabase.storage.from("extensions").upload("nightly.schema.json", schemaStr, {
	cacheControl: "3600",
	upsert: true // overwrite existing file with same name
})
console.log("data", data)
if (error) {
	console.error("Failed to upload schema.json")
	console.error(error)
	process.exit(1)
}
