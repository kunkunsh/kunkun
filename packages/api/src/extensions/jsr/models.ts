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

export const NpmPkgMetadata = v.object({
	name: v.string(),
	description: v.optional(v.string()),
	"dist-tags": v.record(v.string(), v.string()), // latest, next, beta, rc
	versions: v.record(
		v.string(),
		v.object({
			name: v.string(),
			version: v.string(),
			description: v.optional(v.string()),
			dist: v.object({
				tarball: v.string(),
				shasum: v.string(),
				integrity: v.string()
			}),
			dependencies: v.record(v.string(), v.string())
		})
	),
	time: v.objectWithRest(
		{
			created: v.string(),
			modified: v.string()
		},
		v.string()
	)
})
export type NpmPkgMetadata = v.InferOutput<typeof NpmPkgMetadata>
