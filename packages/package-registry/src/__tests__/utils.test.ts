import { describe, expect, it } from "bun:test"
import { getRawFileFromGitHub } from "../utils"

describe("getRawFileFromGitHub", () => {
	it("should return the content of the file", async () => {
		const content = await getRawFileFromGitHub(
			"kunkunsh",
			"kunkun-ext-download-twitter-video",
			"71e5b74b4baaca68433c11cc6233138ca40fd32a",
			"README.md"
		)
		expect(content).toBeDefined()
	})
})
