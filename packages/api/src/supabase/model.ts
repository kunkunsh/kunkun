import { Icon } from "@kksh/api/models"
import * as v from "valibot"

/***
 * Correspond to `extensions` table in supabase
 */
export const SBExt = v.object({
	identifier: v.string(),
	name: v.string(),
	created_at: v.string(),
	downloads: v.number(),
	short_description: v.string(),
	long_description: v.string(),
	version: v.string(),
	api_version: v.optional(v.string()),
	icon: Icon
})

export type SBExt = v.InferOutput<typeof SBExt>
