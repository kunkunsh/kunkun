import * as v from "valibot"

export const NpmPkgVersionMetadata = v.object({
	name: v.string(),
	type: v.optional(v.string()),
	license: v.optional(v.string()),
	version: v.string(),
	description: v.optional(v.string()),
	dist: v.optional(
		v.object({
			integrity: v.string(),
			shasum: v.optional(v.string()),
			tarball: v.string(),
			fileCount: v.optional(v.number()),
			unpackedSize: v.optional(v.number()),
			attestations: v.optional(
				v.object({
					url: v.string(),
					provenance: v.object({
						predicateType: v.string()
					})
				})
			),
			signatures: v.optional(
				v.array(
					v.object({
						keyid: v.string(),
						sig: v.string()
					})
				)
			)
		})
	),
	gitHead: v.optional(v.string()),
	_npmUser: v.optional(
		v.object({
			name: v.string(),
			email: v.string()
		})
	),
	maintainers: v.optional(
		v.array(
			v.object({
				name: v.string(),
				email: v.string()
			})
		)
	)
})
export type NpmPkgVersionMetadata = v.InferOutput<typeof NpmPkgVersionMetadata>

/**
 * Full metadata of an npm package
 * Sample URL: https://registry.npmjs.org/@huakunshen/jsr-client
 */
export const NpmPkgMetadata = v.object({
	name: v.string(),
	description: v.optional(v.string()),
	"dist-tags": v.record(v.string(), v.string()), // latest, next, beta, rc
	versions: v.record(v.string(), NpmPkgVersionMetadata),
	time: v.objectWithRest(
		{
			created: v.string(),
			modified: v.string()
		},
		v.string()
	)
})
export type NpmPkgMetadata = v.InferOutput<typeof NpmPkgMetadata>

export const Provenance = v.object({
	summary: v.object({
		subjectAlternativeName: v.string(),
		certificateIssuer: v.string(),
		issuer: v.string(),
		issuerDisplayName: v.string(),
		buildTrigger: v.string(),
		buildConfigUri: v.string(),
		sourceRepositoryUri: v.string(),
		sourceRepositoryDigest: v.string(),
		sourceRepositoryRef: v.string(),
		runInvocationUri: v.string(),
		expiresAt: v.string(),
		includedAt: v.string(),
		resolvedSourceRepositoryCommitUri: v.string(),
		transparencyLogUri: v.string(),
		buildConfigDisplayName: v.string(),
		resolvedBuildConfigUri: v.string(),
		artifactName: v.string()
	}),
	sourceCommitResponseCode: v.number(),
	sourceCommitUnreachable: v.boolean(),
	sourceCommitNotFound: v.boolean()
})
export type Provenance = v.InferOutput<typeof Provenance>

export const NpmSearchResultObject = v.object({
	downloads: v.object({
		monthly: v.number(),
		weekly: v.number()
	}),
	dependents: v.number(),
	updated: v.string(),
	searchScore: v.number(),
	package: v.object({
		name: v.string(),
		keywords: v.array(v.string()),
		version: v.string(),
		description: v.optional(v.string()),
		publisher: v.object({
			email: v.string(),
			username: v.string()
		}),
		maintainers: v.array(
			v.object({
				email: v.string(),
				username: v.string()
			})
		),
		license: v.optional(v.string()),
		date: v.string(),
		links: v.object({
			npm: v.string()
		})
	}),
	score: v.object({
		final: v.number(),
		detail: v.object({
			popularity: v.number(),
			quality: v.number(),
			maintenance: v.number()
		}),
		flags: v.optional(
			v.object({
				insecure: v.number()
			})
		)
	})
})
export type NpmSearchResultObject = v.InferOutput<typeof NpmSearchResultObject>
export const NpmSearchResults = v.object({ objects: v.array(NpmSearchResultObject) })
export type NpmSearchResults = v.InferOutput<typeof NpmSearchResults>
