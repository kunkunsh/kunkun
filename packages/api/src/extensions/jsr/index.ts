import {
	client,
	getPackage,
	getPackageVersion,
	type GitHubRepository
} from "@hk/jsr-client/hey-api-client"
import { ExtPackageJson } from "@kksh/api/models"
import * as v from "valibot"
import type { JsrPackageMetadata, NpmPkgMetadata } from "./models"

client.setConfig({
	baseUrl: "https://api.jsr.io"
})

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
 * @returns
 */
export async function isSignedByGitHubAction(
	scope: string,
	name: string,
	version: string
): Promise<boolean> {
	const pkgVersion = await getPackageVersion({
		path: {
			scope,
			package: name,
			version
		}
	})
	return !!pkgVersion.data?.rekorLogId
}

export async function getJsrPackageGitHubRepo(
	scope: string,
	name: string
): Promise<GitHubRepository | null> {
	const pkg = await getPackage({
		path: {
			scope,
			package: name
		}
	})
	return pkg.data?.githubRepository ?? null
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

/**
 * Get the tarball url of a Jsr package
 * @param scope
 * @param name
 * @param version
 * @returns
 */
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

/**
 * Check if a Jsr package exists
 * @param scope
 * @param name
 * @returns
 */
export function jsrPackageExists(scope: string, name: string, version?: string): Promise<boolean> {
	if (version) {
		return getPackageVersion({
			path: {
				scope,
				package: name,
				version
			}
		}).then((res) => res.response.ok && res.response.status === 200)
	}
	return getPackage({
		path: {
			scope,
			package: name
		}
	}).then((res) => res.response.ok && res.response.status === 200)
}

/**
 * Get the tarball size of a Jsr package
 * @param url tarball url, can technically be any url
 * @returns tarball size in bytes
 */
export function getTarballSize(url: string): Promise<number> {
	return fetch(url, { method: "HEAD" }).then((res) => {
		if (!(res.ok && res.status === 200)) {
			throw new Error("Failed to fetch tarball size")
		}
		return Number(res.headers.get("Content-Length"))
	})
}

/**
 * Validate a Jsr package as a Kunkun extension
 * - check if jsr pkg is linked to a github repo
 * - check if jsr pkg is signed with github action
 * - check if user's github username is the same as repo's owner name
 * - check if jsr.json or deno.json has the same version as package.json
 * - validate package.json format against latest schema
 * @param payload
 * @returns
 */
export async function validateJsrPackageAsKunkunExtension(payload: {
	jsrPackage: {
		scope: string
		name: string
		version: string
	}
	githubUsername: string
	tarballSizeLimit?: number
}): Promise<boolean> {
	// check if jsr package exists
	const jsrExists = await jsrPackageExists(
		payload.jsrPackage.scope,
		payload.jsrPackage.name,
		payload.jsrPackage.version
	)
	if (!jsrExists) {
		throw new Error("JSR package does not exist")
	}
	/* -------------------------------------------------------------------------- */
	/*                 check if jsr pkg is linked to a github repo                */
	/* -------------------------------------------------------------------------- */
	const githubRepo = await getJsrPackageGitHubRepo(
		payload.jsrPackage.scope,
		payload.jsrPackage.name
	)
	if (githubRepo === null) {
		throw new Error("JSR package is not linked to a GitHub repository")
	}
	/* -------------------------------------------------------------------------- */
	/*                check if jsr pkg is signed with github action               */
	/* -------------------------------------------------------------------------- */
	const signed = await isSignedByGitHubAction(
		payload.jsrPackage.scope,
		payload.jsrPackage.name,
		payload.jsrPackage.version
	)
	if (!signed) {
		throw new Error("JSR package is not signed by GitHub Actions")
	}
	/* -------------------------------------------------------------------------- */
	/*      check if user's github username is the same as repo's owner name      */
	/* -------------------------------------------------------------------------- */
	if (githubRepo.owner?.toLowerCase() !== payload.githubUsername.toLowerCase()) {
		throw new Error(
			`GitHub repository owner does not match JSR package owner: ${githubRepo.owner} !== ${payload.githubUsername}`
		)
	}
	/* -------------------------------------------------------------------------- */
	/*     check if jsr.json or deno.json has the same version as package.json    */
	/* -------------------------------------------------------------------------- */
	const packageJsonContent = await getJsrPackageSrcFile(
		payload.jsrPackage.scope,
		payload.jsrPackage.name,
		payload.jsrPackage.version,
		"package.json"
	)
	if (!packageJsonContent) {
		throw new Error("Could not find package.json in JSR package")
	}
	let packageJson: any
	try {
		packageJson = JSON.parse(packageJsonContent)
	} catch (error) {
		throw new Error("Failed to parse package.json")
	}
	if (packageJson.version !== payload.jsrPackage.version) {
		// no need to fetch jsr.json or deno.json content, as we already know the version is valid with JSR API
		throw new Error("Package version in package.json does not match JSR package version")
	}

	/* -------------------------------------------------------------------------- */
	/*             validate package.json format against latest schema             */
	/* -------------------------------------------------------------------------- */
	const parseResult = v.safeParse(ExtPackageJson, packageJson)
	if (!parseResult.success) {
		throw new Error("package.json format not valid", { cause: v.flatten(parseResult.issues) })
	}
	const tarballUrl = await getNpmPackageTarballUrl(
		payload.jsrPackage.scope,
		payload.jsrPackage.name,
		payload.jsrPackage.version
	)
	if (!tarballUrl) {
		throw new Error("Could not get tarball URL for JSR package")
	}
	const tarballSize = await getTarballSize(tarballUrl)
	const sizeLimit = payload.tarballSizeLimit ?? 50 * 1024 * 1024 // default to 50MB
	if (tarballSize > sizeLimit) {
		throw new Error(
			`Package tarball size (${tarballSize} bytes) exceeds limit of ${sizeLimit} bytes`
		)
	}
	return true
}
