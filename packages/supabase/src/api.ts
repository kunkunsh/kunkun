import { SBExt } from "@kksh/api/supabase"
import type { Database, Tables } from "@kksh/api/supabase/types"
import type { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js"
import * as v from "valibot"

export class SupabaseAPI {
	constructor(private supabase: SupabaseClient<Database>) {}
	async getExtList(): Promise<SBExt[]> {
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
				const parsedNode = v.safeParse(SBExt, x)
				if (!parsedNode.success) {
					console.error(`Fail to parse extension`, x)
					console.warn(parsedNode.issues)
					console.error(v.flatten(parsedNode.issues))
				}
				return parsedNode.success ? v.parse(SBExt, parsedNode.output) : null
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
	}

	async incrementDownloads({
		identifier,
		version
	}: {
		identifier: string
		version: string
	}): Promise<{ downloads: number }> {
		return this.supabase.functions
			.invoke("increment-downloads", {
				body: { identifier, version }
			})
			.then(({ data, error }) => {
				if (error) {
					throw error
				}
				const parsed = v.safeParse(
					v.object({
						downloads: v.number()
					}),
					data
				)
				if (!parsed.success) {
					throw new Error("Fail to parse increment downloads response")
				}
				return parsed.output
			})
	}

	translateExtensionFilePathToUrl(tarballPath: string): string {
		return this.supabase.storage.from("extensions").getPublicUrl(tarballPath).data.publicUrl
	}
}
