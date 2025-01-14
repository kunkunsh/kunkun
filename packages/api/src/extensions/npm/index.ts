import * as v from "valibot"
import {
	NpmPkgMetadata,
	NpmPkgVersionMetadata,
	NpmSearchResultObject,
	NpmSearchResults
} from "./models"

/**
 * Get the full metadata of an npm package
 * @param pkgName
 * @returns
 */
export function getFullNpmPackageInfo(pkgName: string): Promise<NpmPkgMetadata> {
	return fetch(`https://registry.npmjs.org/${pkgName}`).then((res) => res.json())
}

export function getNpmPackageVersionInfo(
	pkgName: string,
	version: string
): Promise<NpmPkgVersionMetadata> {
	return fetch(`https://registry.npmjs.org/${pkgName}/${version}`).then((res) => res.json())
}

/**
 * Get the provenance of an npm package
 * If a package has no provenance, return null
 * @param pkgName
 * @param version
 * @returns
 */
export function getNpmPkgProvenance(pkgName: string, version: string) {
	return fetch(`https://www.npmjs.com/package/${pkgName}/v/${version}/provenance`)
		.then((res) => res.json())
		.catch((err) => null)
}

/**
 * List all packages under a scope
 * @example
 * To get package names under a scope, you can do:
 * ```ts
 * (await listPackagesOfMaintainer("huakunshen")).map((pkg) => pkg.package.name)
 * ```
 * @param scope npm organization or username
 * @returns
 */
export function listPackagesOfMaintainer(username: string): Promise<NpmSearchResultObject[]> {
	return fetch(`https://registry.npmjs.org/-/v1/search?text=maintainer:${username}&size=250`, {
		headers: {
			"sec-fetch-dest": "document"
		}
	})
		.then((res) => res.json())
		.then((res) => v.parse(NpmSearchResults, res).objects)
}

export function listPackagesOfScope(scope: string): Promise<NpmSearchResultObject[]> {
	return fetch(`https://registry.npmjs.org/-/v1/search?text=${scope}&size=250`, {
		headers: {
			"sec-fetch-dest": "document"
		}
	})
		.then((res) => res.json())
		.then((res) => v.parse(NpmSearchResults, res).objects)
}

export function getNpmPackageTarballUrl(
	pkgName: string,
	version: string
): Promise<string | undefined> {
	return getNpmPackageVersionInfo(pkgName, version).then((res) => res.dist?.tarball)
}
