/**
 * TODO: move this module to another folder
 */
import { Octokit } from "@octokit/rest"
import gh from "parse-github-url"

/**
 * Check if a user is a public member of a GitHub organization
 * @param orgName - The name of the GitHub organization
 * @param username - The username of the user
 * @returns A promise that resolves to a boolean indicating if the user is a public member of the organization
 */
export function userIsPublicMemberOfGitHubOrg(orgName: string, username: string): Promise<boolean> {
	const octokit = new Octokit()
	return octokit.orgs
		.checkPublicMembershipForUser({ org: orgName, username })
		.then(() => true)
		.catch(() => false)
}

/**
 * Only works if user grants read:org scope with the org when login
 * @param orgName
 * @param username
 * @param githubToken
 */
export function authenticatedUserIsMemberOfGitHubOrg(
	orgName: string,
	githubToken: string
): Promise<boolean> {
	const octokit = new Octokit({ auth: githubToken })
	return octokit.orgs.listForAuthenticatedUser().then((res) => {
		return res.data.some((org) => org.login === orgName)
	})
}

/**
 * Parse a GitHub repository URI into owner and repo
 * If not a valid GitHub repository URI, throw an error
 * @param uri
 * @returns owner and repo
 */
export function parseGitHubRepoFromUri(uri: string): {
	owner: string
	repo: string
} {
	const ghUrl = gh(uri)
	if (!ghUrl) {
		throw new Error("Invalid GitHub repository URI")
	}
	if (!ghUrl.owner || !ghUrl.name) {
		throw new Error("Invalid GitHub repository URI")
	}
	return { owner: ghUrl.owner, repo: ghUrl.name }
}

/**
 * Get GitHub repository metadata
 * @param owner
 * @param repo
 * @param githubToken - Optional GitHub token to prevent rate limiting
 * @returns repository metadata
 */
export function getGitHubRepoMetadata(owner: string, repo: string, githubToken?: string) {
	const octokit = new Octokit({ auth: githubToken })
	return octokit.rest.repos.get({ owner, repo }).then((res) => res.data)
}
