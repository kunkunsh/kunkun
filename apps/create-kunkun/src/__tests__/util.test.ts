import { describe, expect, test } from "bun:test"
import { getLatestNpmPkgInfo, getLatestNpmPkgVersion } from "../utils"

test("getLatestNpmPkgInfo", async () => {
	const pkg = await getLatestNpmPkgInfo("@kksh/vue")
	expect(pkg.name).toBe("@kksh/vue")
	expect(pkg.version).toBeDefined()
})

test("getLatestNpmPkgVersion", async () => {
	const version = await getLatestNpmPkgVersion("@kksh/vue")
	expect(version).toBeDefined()
})
