import { clean, gte, parse, satisfies, sort } from "semver"
import * as v from "valibot"

export const breakingChangesVersionCheckpoints = [
	{ version: "0.0.1", changelog: "" },
	{ version: "0.0.12-beta.0", changelog: "" },
	{ version: "0.0.12-beta.1", changelog: "" },
	{
		version: "0.0.17",
		changelog: "New Custom UI loading method, remove base url config requirement."
	},
	{
		version: "0.0.34",
		changelog: "Replace comlink with kkrpc, extensions using comlink won't work anymore."
	}
]
const checkpointVersions = breakingChangesVersionCheckpoints.map((c) => c.version)
const sortedCheckpointVersions = sort(checkpointVersions)

export const version = "0.0.33"

export function isVersionBetween(v: string, start: string, end: string) {
	const vCleaned = clean(v)
	const startCleaned = clean(start)
	const endCleaned = clean(end)
	return satisfies(vCleaned!, `${startCleaned} - ${endCleaned}`)
}

/**
 * Check if a given version is compatible with this API version
 * Basically, this checks if the version is greater than or equal to the last checkpoint version
 * @param version
 */
export function isCompatible(version: string) {
	return gte(version, v.parse(v.string(), sortedCheckpointVersions.at(-1)))
}
