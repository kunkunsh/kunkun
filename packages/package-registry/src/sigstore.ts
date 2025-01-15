import * as v from "valibot"
import { SigstoreAttestation, type RawRekorLog, type RawRekorLogEntry } from "./models"

export function getRekorLogId(logIndex: string): Promise<RawRekorLog> {
	return fetch(`https://rekor.sigstore.dev/api/v1/log/entries?logIndex=${logIndex}`).then((res) =>
		res.json()
	)
}

/**
 * For our use case (JSR), we expect only one entry in the rekor log, so we can just return the first one
 * If there are multiple entries, we throw an error
 * @param rekorLog
 * @returns
 */
export function parseTheOnlyRecord(rekorLog: RawRekorLog): RawRekorLogEntry {
	const entryUUIDs = Object.keys(rekorLog)
	if (entryUUIDs.length !== 1) {
		throw new Error("Expected exactly one entry in the rekor log")
	}
	return rekorLog[entryUUIDs[0]]
}

/**
 * Attestation data is base64 encoded, so we need to decode it and parse it with valibot
 * @param rekorLog
 * @returns
 */
export function parseAttestation(rekorLog: RawRekorLogEntry): SigstoreAttestation {
	const attestationData = rekorLog.attestation.data
	const decoded = atob(attestationData)
	const decodedJson = JSON.parse(decoded)
	const parsed = v.safeParse(SigstoreAttestation, decodedJson)
	if (!parsed.success) {
		console.error(v.flatten(parsed.issues))
		throw new Error("Failed to parse rekor log attestation")
	}
	return parsed.output
}

/**
 * We expect only one entry in the rekor log, and there should be only one commit in the attestation
 * @param logIndex
 * @returns
 */
export async function getInfoFromRekorLog(logIndex: string): Promise<{
	commit: string
	githubActionInvocationId: string
}> {
	const rawLog = await getRekorLogId(logIndex)
	const record = parseTheOnlyRecord(rawLog)
	const attestation = parseAttestation(record)
	if (attestation.predicate.buildDefinition.resolvedDependencies.length !== 1) {
		throw new Error(
			`Expected exactly one commit in the attestation, got: ${attestation.predicate.buildDefinition.resolvedDependencies.length}`
		)
	}
	console.log(attestation.predicate.runDetails.metadata.invocationId)

	return {
		commit: attestation.predicate.buildDefinition.resolvedDependencies[0].digest.gitCommit,
		githubActionInvocationId: attestation.predicate.runDetails.metadata.invocationId
	}
}
