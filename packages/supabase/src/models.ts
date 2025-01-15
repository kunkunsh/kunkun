/**
 * @module @kksh/supabase/models
 * This module contains some models for supabase database that cannot be code generated, such as JSON fields.
 */
import * as v from "valibot"

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
			workflowPath: v.string("Workflow path of the extension")
		})
	)
})
export type ExtPublishMetadata = v.InferOutput<typeof ExtPublishMetadata>
