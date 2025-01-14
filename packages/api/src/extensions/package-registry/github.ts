/**
 * TODO: move this module to another folder
 */
import { Octokit } from "@octokit/rest"

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
