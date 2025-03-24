import { expect, test } from "bun:test"
import { getGitHubRepoNodeId, parseGitHubRepoFromUri } from "../github"

test("parse github repo from uri", () => {
	expect(parseGitHubRepoFromUri("https://github.com/kunkunsh/kunkun-ext-ossinsight")).toEqual({
		owner: "kunkunsh",
		repo: "kunkun-ext-ossinsight"
	})
	expect(() => parseGitHubRepoFromUri("invalid-uri")).toThrow("Invalid GitHub repository URI")
})

test("get github repo id", async () => {
	const id = await getGitHubRepoNodeId("kunkunsh", "kunkun")
	expect(id).toBeDefined()
})
