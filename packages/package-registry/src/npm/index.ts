import { ExtPackageJson } from "@kksh/api/models";
import * as v from "valibot";
import {
	authenticatedUserIsMemberOfGitHubOrg,
	parseGitHubRepoFromUri,
	userIsPublicMemberOfGitHubOrg,
} from "../github";
import {
	NpmPkgMetadata,
	NpmPkgVersionMetadata,
	NpmSearchResultObject,
	NpmSearchResults,
	Provenance,
} from "./models";

export * from "./models";

/**
 * Get the full metadata of an npm package
 * @param pkgName
 * @returns
 */
export function getFullNpmPackageInfo(
	pkgName: string,
): Promise<NpmPkgMetadata | null> {
	return fetch(`https://registry.npmjs.org/${pkgName}`).then((
		res,
	) => (res.ok ? res.json() : null));
}

/**
 * Fetch the package.json data of an npm package
 * @param pkgName
 * @param version
 * @returns
 */
export function getNpmPackageInfoByVersion(
	pkgName: string,
	version: string,
): Promise<NpmPkgVersionMetadata | null> {
	return fetch(`https://registry.npmjs.org/${pkgName}/${version}`).then((
		res,
	) => res.ok ? res.json() : null);
}

/**
 * Get the provenance of an npm package
 * If a package has no provenance, return null
 * @param pkgName
 * @param version
 * @returns
 */
export function getNpmPkgProvenance(
	pkgName: string,
	version: string,
): Promise<Provenance | null> {
	return fetch(
		`https://www.npmjs.com/package/${pkgName}/v/${version}/provenance`,
	)
		.then((res) => res.json())
		.catch((err) => null);
}

/**
 * List all packages under a scope
 * @example
 * To get package names under a scope, you can do:
 * ```ts
 * (await listPackagesOfMaintainer("huakunshen")).map((pkg) => pkg.package.name)
 * ```
 * @param username npm organization or username
 * @returns
 */
export function listPackagesOfMaintainer(
	username: string,
): Promise<NpmSearchResultObject[]> {
	return fetch(
		`https://registry.npmjs.org/-/v1/search?text=maintainer:${username}&size=250`,
		{
			headers: {
				"sec-fetch-dest": "document",
			},
		},
	)
		.then((res) => res.json())
		.then((res) => v.parse(NpmSearchResults, res).objects);
}

export function listPackagesOfScope(
	scope: string,
): Promise<NpmSearchResultObject[]> {
	return fetch(
		`https://registry.npmjs.org/-/v1/search?text=${scope}&size=250`,
		{
			headers: {
				"sec-fetch-dest": "document",
			},
		},
	)
		.then((res) => res.json())
		.then((res) => v.parse(NpmSearchResults, res).objects);
}

export function getNpmPackageTarballUrl(
	pkgName: string,
	version: string,
): Promise<string | undefined> {
	return getNpmPackageInfoByVersion(pkgName, version).then((res) =>
		res?.dist?.tarball
	);
}

export function npmPackageExists(
	pkgName: string,
	version: string,
): Promise<boolean> {
	return getNpmPackageInfoByVersion(pkgName, version).then((res) =>
		res !== null
	);
}

export async function validateNpmPackageAsKunkunExtension(payload: {
	pkgName: string;
	version: string;
	githubUsername: string;
	tarballSizeLimit?: number;
	githubToken?: string;
	provenance?: Provenance; // provenance API has cors policy, when we run this validation on client side, a provenance should be passed in
}): Promise<{
	error?: string;
	data?: {
		pkgJson: ExtPackageJson;
		tarballUrl: string;
		shasum: string;
		apiVersion: string;
		tarballSize: number;
	};
}> {
	/* -------------------------------------------------------------------------- */
	/*                         check if npm package exist                         */
	/* -------------------------------------------------------------------------- */
	const pkgExists = await npmPackageExists(payload.pkgName, payload.version);
	if (!pkgExists) {
		return { error: "Package does not exist" };
	}
	if (!pkgExists) {
		return { error: "NPM package does not exist" };
	}

	/* -------------------------------------------------------------------------- */
	/*                     check if npm package has provenance                    */
	/* -------------------------------------------------------------------------- */
	const provenance = payload.provenance ?? await getNpmPkgProvenance(
		payload.pkgName,
		payload.version,
	);
	if (!provenance) {
		return {
			error:
				"Package doesn't have provenance, not signed by github action",
		};
	}
	if (provenance.sourceCommitUnreachable) {
		return { error: "Package's source commit is unreachable" };
	}
	if (provenance.sourceCommitNotFound) {
		return { error: "Package's source commit is not found" };
	}
	/* -------------------------------------------------------------------------- */
	/*                  check if npm pkg is linked to github repo                 */
	/* -------------------------------------------------------------------------- */
	const repoUri = provenance.summary.sourceRepositoryUri;
	const githubRepo = parseGitHubRepoFromUri(repoUri);

	/* -------------------------------------------------------------------------- */
	/*                            Verify Repo Ownership                           */
	/* -------------------------------------------------------------------------- */
	if (githubRepo.owner !== payload.githubUsername) {
		const isPublicMemeber = await userIsPublicMemberOfGitHubOrg(
			githubRepo.owner,
			payload.githubUsername,
		);
		let isOrgMember = false;
		if (payload.githubToken) {
			isOrgMember = await authenticatedUserIsMemberOfGitHubOrg(
				githubRepo.owner,
				payload.githubToken,
			);
		}
		if (!isPublicMemeber && !isOrgMember) {
			return {
				error:
					`You (${payload.githubUsername}) are not authorized to publish this package. Only ${githubRepo.owner} or its organization members can publish it.`,
			};
		}
	}

	/* -------------------------------------------------------------------------- */
	/*             validate package.json format against latest schema             */
	/* -------------------------------------------------------------------------- */

	const packageJson = await getNpmPackageInfoByVersion(
		payload.pkgName,
		payload.version,
	);
	if (!packageJson) {
		return { error: "Could not find package.json in NPM package" };
	}

	const parseResult = v.safeParse(ExtPackageJson, packageJson);
	if (!parseResult.success) {
		console.log(v.flatten(parseResult.issues));
		return { error: `package.json format not valid` };
	}
	/* -------------------------------------------------------------------------- */
	/*                            get more package info                           */
	/* -------------------------------------------------------------------------- */
	const tarballUrl = packageJson.dist?.tarball;
	if (!tarballUrl) {
		return { error: "Could not get tarball URL for NPM package" };
	}
	const shasum = packageJson.dist?.shasum;
	if (!shasum) {
		return { error: "Could not get shasum for NPM package" };
	}

	const apiVersion = parseResult.output.dependencies?.["@kksh/api"];
	if (!apiVersion) {
		return {
			error:
				`Extension ${parseResult.output.kunkun.identifier} doesn't not have @kksh/api as a dependency`,
		};
	}

	return {
		data: {
			pkgJson: parseResult.output,
			tarballUrl,
			shasum,
			apiVersion,
			tarballSize: 0,
		},
	};
}
