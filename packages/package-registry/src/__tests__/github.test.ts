import { expect, test } from "bun:test"
import { getGitHubRepoMetadata, parseGitHubRepoFromUri } from "../github"

test("parse github repo from uri", () => {
	expect(parseGitHubRepoFromUri("https://github.com/kunkunsh/kunkun-ext-ossinsight")).toEqual({
		owner: "kunkunsh",
		repo: "kunkun-ext-ossinsight"
	})
	expect(() => parseGitHubRepoFromUri("invalid-uri")).toThrow("Invalid GitHub repository URI")
})

test("get github repo metadata", async () => {
	const metadata = await getGitHubRepoMetadata("kunkunsh", "kunkun-ext-ossinsight")
	expect(metadata).toBeDefined()
})
