import { Icon } from "@kksh/api/models"
import { type Tables } from "@kksh/supabase"
import { createClient, type PostgrestSingleResponse } from "@supabase/supabase-js"
import * as v from "valibot"
import { number, object, optional, pipe, string, transform, type InferOutput } from "valibot"
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./constants"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const ExtItem = object({
	identifier: string(),
	name: string(),
	created_at: string(),
	downloads: number(),
	short_description: string(),
	long_description: string(),
	version: optional(string()),
	api_version: optional(string()),
	icon: Icon
})

export type ExtItem = InferOutput<typeof ExtItem>

export async function getExtList(): Promise<ExtItem[]> {
	const res = await supabase
		.from("extensions")
		.select(
			"identifier, version, api_version, name, downloads, short_description, long_description, icon, created_at"
		)
		.order("downloads", { ascending: false })
		.select()
	const dbExts: Tables<"extensions">[] = res.data ?? []
	return dbExts
		.map((x) => {
			const parsedNode = v.safeParse(ExtItem, x)
			if (!parsedNode.success) {
				console.error(`Fail to parse extension`, x)
				console.warn(parsedNode.issues)
				console.error(v.flatten(parsedNode.issues))
			}
			return parsedNode.success ? v.parse(ExtItem, parsedNode.output) : null
		})
		.filter((x) => x !== null)
}
