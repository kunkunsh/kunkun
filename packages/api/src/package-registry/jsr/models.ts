import * as v from "valibot"

export const JsrPackageMetadata = v.object({
	scope: v.string(),
	name: v.string(),
	latest: v.string(),
	versions: v.record(
		v.string(),
		v.object({
			yanked: v.optional(v.boolean())
		})
	)
})
export type JsrPackageMetadata = v.InferOutput<typeof JsrPackageMetadata>
