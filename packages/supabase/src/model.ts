import { Icon } from "@kksh/api/models"
import * as v from "valibot"

export const ExtItem = v.object({
	identifier: v.string(),
	name: v.string(),
	created_at: v.string(),
	downloads: v.number(),
	short_description: v.string(),
	long_description: v.string(),
	version: v.optional(v.string()),
	api_version: v.optional(v.string()),
	icon: Icon
})

export type ExtItem = v.InferOutput<typeof ExtItem>
