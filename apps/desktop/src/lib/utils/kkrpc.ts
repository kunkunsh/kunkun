import { parseAPIVersion } from "@kksh/extension/load"
import type { ExtPackageJsonExtra } from "@kunkunapi/src/models/manifest"
import semver from "semver"

/**
 * Decide the serialization method for kkrpc based on the api version
 * apiVersion is populated in loadExtensionManifestFromDisk, but we parse it again
 * @param apiVersion - The version of the @kksh/api
 * @returns "superjson" or "json"
 */
export function decideKkrpcSerialization(ext: ExtPackageJsonExtra): "superjson" | "json" {
	const apiVersion = parseAPIVersion(ext.dependencies || {})
	if (apiVersion && semver.lte(apiVersion, "0.1.5")) {
		// 0.1.6 is the first version that supports superjson and default to use superjson
		return "json"
	}
	// fallback default to use superjson, some extensions might not install @kksh/api
	return "superjson"
}
