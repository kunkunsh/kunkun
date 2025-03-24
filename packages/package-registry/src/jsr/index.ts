import https from "https"
import {
	client,
	getPackage,
	getPackageVersion,
	type GitHubRepository
} from "@huakunshen/jsr-client/hey-api-client"
import { ExtPackageJson, License } from "@kksh/api/models"
import * as v from "valibot"
import {
	authenticatedUserIsMemberOfGitHubOrg,
	getGitHubRepoMetadata,
	userIsPublicMemberOfGitHubOrg
} from "../github"
import type { ExtensionPublishValidationData } from "../models"
import type { NpmPkgMetadata } from "../npm/models"
import { getInfoFromRekorLog } from "../sigstore"
import { getTarballSize } from "../utils"
import type { JsrPackageMetadata } from "./models"

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
 * @returns rekor log index if signed, undefined if not signed
 */
export async function isSignedByGitHubAction(
	scope: string,
	name: string,
	version: string
): Promise<string | null> {
	const pkgVersion = await getPackageVersion({
		path: {
			scope,
			package: name,
			version
		}
	})
	return pkgVersion.data?.rekorLogId ?? null
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
	return fetch(url, {
		headers: {
			Accept: "application/json"
		}
	}).then((res) => res.text())
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
 * Get the metadata of a specific version of a Jsr package
 * @param scope
 * @param name
 * @param version
 * @returns
 */
export function getJsrNpmPackageVersionMetadata(scope: string, name: string, version: string) {
	return getJsrNpmPkgMetadata(scope, name).then((metadata) => {
		return metadata.versions[version]
	})
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
	const metadata = await getJsrNpmPackageVersionMetadata(scope, name, version)
	const tarballUrl: string | undefined = metadata?.dist?.tarball
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
	githubToken?: string
}): Promise<{
	error?: string
	data?: ExtensionPublishValidationData
}> {
	/* -------------------------------------------------------------------------- */
	/*                         check if jsr package exists                        */
	/* -------------------------------------------------------------------------- */
	const jsrExists = await jsrPackageExists(
		payload.jsrPackage.scope,
		payload.jsrPackage.name,
		payload.jsrPackage.version
	)
	if (!jsrExists) {
		return { error: "JSR package does not exist" }
	}
	/* -------------------------------------------------------------------------- */
	/*                 check if jsr pkg is linked to a github repo                */
	/* -------------------------------------------------------------------------- */
	const githubRepo = await getJsrPackageGitHubRepo(
		payload.jsrPackage.scope,
		payload.jsrPackage.name
	)
	if (githubRepo === null) {
		return { error: "JSR package is not linked to a GitHub repository" }
	}
	/* -------------------------------------------------------------------------- */
	/*                check if jsr pkg is signed with github action               */
	/* -------------------------------------------------------------------------- */
	const rekorLogId = await isSignedByGitHubAction(
		payload.jsrPackage.scope,
		payload.jsrPackage.name,
		payload.jsrPackage.version
	)
	if (!rekorLogId) {
		return { error: "JSR package is not signed by GitHub Actions" }
	}
	/* -------------------------------------------------------------------------- */
	/*      check if user's github username is the same as repo's owner name      */
	/* -------------------------------------------------------------------------- */
	if (!githubRepo.owner) {
		return { error: "Package's Linked GitHub repository owner is not found." }
	}
	if (!githubRepo.name) {
		return { error: "Package's Linked GitHub repository name is not found." }
	}
	if (githubRepo.owner.toLowerCase() !== payload.githubUsername.toLowerCase()) {
		const isPublicMemeber = await userIsPublicMemberOfGitHubOrg(
			githubRepo.owner,
			payload.githubUsername
		)
		let isOrgMember = false
		if (payload.githubToken) {
			isOrgMember = await authenticatedUserIsMemberOfGitHubOrg(
				githubRepo.owner,
				payload.githubToken
			)
		}
		if (!isPublicMemeber && !isOrgMember) {
			return {
				error: `You (${payload.githubUsername}) are not authorized to publish this package. Only ${githubRepo.owner} or its organization members can publish it.`
			}
		}
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
		return { error: "Could not find package.json in JSR package" }
	}
	let packageJson: any
	try {
		packageJson = JSON.parse(packageJsonContent)
	} catch (error) {
		return { error: "Failed to parse package.json" }
	}
	if (!packageJson.license) {
		return { error: "Package license field is not found" }
	}

	const licenseParsed = v.safeParse(License, packageJson.license)
	if (!licenseParsed.success) {
		return { error: `Package license field ${packageJson.license} is not valid` }
	}

	if (packageJson.version !== payload.jsrPackage.version) {
		// no need to fetch jsr.json or deno.json content, as we already know the version is valid with JSR API
		return {
			error: "Package version in package.json does not match JSR package version"
		}
	}

	/* -------------------------------------------------------------------------- */
	/*             validate package.json format against latest schema             */
	/* -------------------------------------------------------------------------- */
	const parseResult = v.safeParse(ExtPackageJson, packageJson)
	if (!parseResult.success) {
		return { error: "package.json format not valid" }
	}
	const npmPkgVersionMetadata = await getJsrNpmPackageVersionMetadata(
		payload.jsrPackage.scope,
		payload.jsrPackage.name,
		payload.jsrPackage.version
	)
	const tarballUrl = npmPkgVersionMetadata.dist?.tarball
	const shasum = npmPkgVersionMetadata.dist?.shasum
	if (!shasum) {
		return { error: "Could not get shasum for JSR package" }
	}
	if (!tarballUrl) {
		return { error: "Could not get tarball URL for JSR package" }
	}
	const tarballSize = await getTarballSize(tarballUrl)
	const sizeLimit = payload.tarballSizeLimit ?? 50 * 1024 * 1024 // default to 50MB
	if (tarballSize > sizeLimit) {
		return {
			error: `Package tarball size (${tarballSize} bytes) exceeds limit of ${sizeLimit} bytes`
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                             get README content                             */
	/* -------------------------------------------------------------------------- */

	const readmeContent = await getJsrPackageSrcFile(
		payload.jsrPackage.scope,
		payload.jsrPackage.name,
		payload.jsrPackage.version,
		parseResult.output.readme ?? "README.md"
	)

	/* -------------------------------------------------------------------------- */
	/*                      get @kksh/api dependency version                      */
	/* -------------------------------------------------------------------------- */
	const apiVersion = parseResult.output.dependencies?.["@kksh/api"]
	if (!apiVersion) {
		return {
			error: `Extension ${packageJson.kunkun.identifier} doesn't not have @kksh/api as a dependency`
		}
	}
	const rekorInfo = await getInfoFromRekorLog(rekorLogId)

	/* -------------------------------------------------------------------------- */
	/*                             Get GitHub Node ID                             */
	/* -------------------------------------------------------------------------- */
	const githubRepoMetadata = await getGitHubRepoMetadata(
		githubRepo.owner,
		githubRepo.name,
		payload.githubToken
	)

	return {
		data: {
			pkgJson: parseResult.output,
			readmeContent,
			tarballUrl,
			license: parseResult.output.license,
			shasum,
			apiVersion,
			tarballSize,
			rekorLogIndex: rekorLogId,
			github: {
				githubActionInvocationId: rekorInfo.githubActionInvocationId,
				commit: rekorInfo.commit,
				repo: githubRepo.name,
				owner: githubRepo.owner,
				workflowPath: rekorInfo.workflowPath,
				repoId: githubRepoMetadata.node_id
			}
		}
	}
}
