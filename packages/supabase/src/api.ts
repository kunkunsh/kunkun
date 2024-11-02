import type { SupabaseClient } from "@supabase/supabase-js"
import * as v from "valibot"
import { ExtItem } from "./model"
import type { Tables } from "./types/database.types"

export class SupabaseAPI {
	constructor(private supabase: SupabaseClient) {}
	async getExtList(): Promise<ExtItem[]> {
		const res = await this.supabase
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
}
