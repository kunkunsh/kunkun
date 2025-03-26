import * as v from "valibot"
import { BaseIcon } from "./icon"

export enum ExtPublishSourceTypeEnum {
	jsr = "jsr",
	npm = "npm"
}

export const ExtPublishMetadata = v.object({
	source: v.optional(v.string("Source of the extension (e.g. url to package)")),
	sourceType: v.optional(v.enum(ExtPublishSourceTypeEnum)),
	rekorLogIndex: v.optional(v.string("Rekor log index of the extension")),
	git: v.optional(
		v.object({
			githubActionInvocationId: v.string("GitHub action invocation ID"),
			repo: v.string("GitHub repo of the extension"),
			owner: v.string("GitHub owner of the extension"),
			commit: v.string("Commit hash of the extension"),
			workflowPath: v.string("Workflow path of the extension"),
			repoNodeId: v.optional(
				v.string("GitHub repo node ID of the extension (a string, not the number id)")
			)
		})
	)
})
export type ExtPublishMetadata = v.InferOutput<typeof ExtPublishMetadata>

/***
 * Correspond to `extensions` table in supabase
 */
export const ExtensionStoreListItem = v.object({
	identifier: v.string(),
	name: v.string(),
	created_at: v.string(),
	downloads: v.number(),
	short_description: v.string(),
	long_description: v.string(),
	version: v.string(),
	api_version: v.optional(v.string()),
	icon: BaseIcon
})

export type ExtensionStoreListItem = v.InferOutput<typeof ExtensionStoreListItem>
