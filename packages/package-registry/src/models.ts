import { ExtPackageJson } from "@kksh/api/models"
import * as v from "valibot"

export const RawRekorLogEntry = v.object({
	attestation: v.object({ data: v.string() }),
	body: v.string(),
	integratedTime: v.number(),
	logID: v.string(),
	logIndex: v.number(),
	verification: v.object({
		inclusionProof: v.object({
			checkpoint: v.string(),
			hashes: v.array(v.string()),
			logIndex: v.number(),
			rootHash: v.string(),
			treeSize: v.number()
		}),
		signedEntryTimestamp: v.string()
	})
})
export type RawRekorLogEntry = v.InferOutput<typeof RawRekorLogEntry>
export const RawRekorLog = v.record(v.string(), RawRekorLogEntry)
export type RawRekorLog = v.InferOutput<typeof RawRekorLog>

export const SigstoreAttestation = v.object({
	type: v.optional(v.string()),
	subject: v.array(
		v.object({ name: v.string(), digest: v.object({ sha256: v.optional(v.string()) }) })
	),
	predicateType: v.string(),
	predicate: v.object({
		buildDefinition: v.object({
			buildType: v.string(),
			resolvedDependencies: v.array(
				v.object({
					uri: v.string(),
					digest: v.object({ gitCommit: v.string() })
				})
			),
			internalParameters: v.object({
				github: v.object({
					eventName: v.optional(v.string()),
					repositoryId: v.optional(v.string()),
					repositoryOwnerId: v.optional(v.string())
				})
			}),
			externalParameters: v.object({
				workflow: v.object({
					ref: v.string(),
					repository: v.string(),
					path: v.string()
				})
			})
		}),
		runDetails: v.object({
			builder: v.object({ id: v.string() }),
			metadata: v.object({ invocationId: v.string() })
		})
	})
})
export type SigstoreAttestation = v.InferOutput<typeof SigstoreAttestation>
export const ExtensionPublishValidationData = v.object({
	pkgJson: ExtPackageJson,
	tarballUrl: v.string(),
	shasum: v.string(),
	apiVersion: v.string(),
	rekorLogIndex: v.string(),
	tarballSize: v.number(),
	github: v.object({
		githubActionInvocationId: v.string(),
		commit: v.string(),
		repo: v.string(),
		owner: v.string(),
		workflowPath: v.string()
	})
})
export type ExtensionPublishValidationData = v.InferOutput<typeof ExtensionPublishValidationData>
