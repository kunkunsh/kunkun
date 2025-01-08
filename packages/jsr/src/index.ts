import type { JsrPackageMetadata, NpmPkgMetadata } from "./models"

export function splitRawJsrPkgName(packageName: string): Promise<{ scope: string; name: string }> {
	return new Promise((resolve, reject) => {
		// write a regex to match the scope and name
		const regex = /^@([^@]+)\/([^@]+)$/
		const match = packageName.match(regex)
		if (!match) {
			return reject(new Error("Invalid Jsr package name"))
		}
		const [, rawScope, name] = match
		const scope = rawScope.startsWith("@") ? rawScope.slice(1) : rawScope
		return resolve({ scope, name })
	})
}

/**
 * Translate a Jsr package name to an npm package name
 * All packages are under `@jsr` scope, thus the npm package name is `@jsr/scope__name`
 * @param scope
 * @param name
 * @returns
 */
export const translateJsrToNpmPkgName = (scope: string, name: string) => `${scope}__${name}`

/**
/**
 * Get the html of a Jsr package main page
 * @param scope
 * @param name
 * @param version
 * @returns
 */
export function getJsrPackageHtml(scope: string, name: string, version?: string) {
	const url = `https://jsr.io/@${scope}/${name}${version ? `@${version}` : ""}`
	return fetch(url, {
		headers: {
			"sec-fetch-dest": "document"
		}
	}).then((res) => res.text())
}

/**
 * Check if a Jsr package is signed by GitHub Actions
 * @param scope
 * @param name
 * @param version
 * @returns
 */
export function signedByGitHubAction(scope: string, name: string, version?: string) {
	return getJsrPackageHtml(scope, name, version).then((html) =>
		html.includes("Built and signed on GitHub Actions")
	)
}

/**
 * Get the metadata of a Jsr package
 * Data includes
 * - latest version
 * - versions (whether a version is yanked)
 * @param scope
 * @param name
 * @returns
 */
export function getJsrPackageMetadata(scope: string, name: string): Promise<JsrPackageMetadata> {
	const url = `https://jsr.io/@${scope}/${name}/meta.json`
	return fetch(url).then((res) => res.json())
}

/**
 * Given a jsr package and path to the file, return the file content
 * @param scope
 * @param name
 * @param version
 * @param file
 * @returns
 */
export function getJsrPackageSrcFile(
	scope: string,
	name: string,
	version: string,
	file: string
): Promise<string | undefined> {
	const url = `https://jsr.io/@${scope}/${name}/${version}/${file}`
	return fetch(url)
		.then((res) => res.text())
		.catch(() => undefined)
}

export function getJsrPackagePackageJson(
	scope: string,
	name: string,
	version: string
): Promise<string | undefined> {
	return getJsrPackageSrcFile(scope, name, version, "package.json")
}

export function getJsrPackageREADME(
	scope: string,
	name: string,
	version: string
): Promise<string | undefined> {
	return getJsrPackageSrcFile(scope, name, version, "README.md")
}

/**
 * Jsr provides a npm compatible registry, so we can get the metadata of the npm package
 * @param scope
 * @param name
 * @returns
 */
export function getJsrNpmPkgMetadata(scope: string, name: string): Promise<NpmPkgMetadata> {
	// Sample: https://npm.jsr.io/@jsr/kunkun__api
	const url = `https://npm.jsr.io/@jsr/${translateJsrToNpmPkgName(scope, name)}`
	return fetch(url).then((res) => res.json())
}

export async function getNpmPackageTarballUrl(
	scope: string,
	name: string,
	version: string
): Promise<string | undefined> {
	const metadata = await getJsrNpmPkgMetadata(scope, name)
	const tarballUrl: string | undefined = metadata.versions[version]?.dist.tarball
	return tarballUrl
}

/**
 * Get all versions of a Jsr package
 * @param scope
 * @param name
 * @returns
 */
export async function getAllVersionsOfJsrPackage(scope: string, name: string): Promise<string[]> {
	const metadata = await getJsrNpmPkgMetadata(scope, name)
	return Object.keys(metadata.versions)
}
