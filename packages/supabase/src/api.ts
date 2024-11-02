import type { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js"
import * as v from "valibot"
import { ExtItem } from "./model"
import type { Database, Tables } from "./types/database.types"

export class SupabaseAPI {
	constructor(private supabase: SupabaseClient<Database>) {}
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

	async getLatestExtPublish(
		identifier: string
	): Promise<PostgrestSingleResponse<Tables<"ext_publish">>> {
		return this.supabase
			.from("ext_publish")
			.select(
				"created_at, name, version, manifest, shasum, size, tarball_path, cmd_count, identifier, downloads, demo_images, api_version"
			)
			.order("created_at", { ascending: false })
			.eq("identifier", identifier)
			.select()
			.limit(1)
			.single()
		// if (error) {
		// 	console.error(error)
		// 	throw error
		// }
		// return data
	}
}
