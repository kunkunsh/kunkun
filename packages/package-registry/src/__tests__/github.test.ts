import { expect, test } from "bun:test"
import { parseGitHubRepoFromUri } from "../github"

test("parse github repo from uri", () => {
	expect(parseGitHubRepoFromUri("https://github.com/huakunshen/kunkun-ext-ossinsight")).toEqual({
		owner: "huakunshen",
		repo: "kunkun-ext-ossinsight"
	})
})
