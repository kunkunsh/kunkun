import { describe, expect, test } from "bun:test"
import { validateNpmPackageAsKunkunExtension } from ".."

describe("validate kunkun extension", () => {
	test("A working extension", async () => {
		const res = await validateNpmPackageAsKunkunExtension({
			pkgName: "kunkun-ext-ossinsight",
			version: "0.0.4",
			githubUsername: "huakunshen"
		})
		expect(res.error).toBeUndefined()
		expect(res.data?.github.commit).toBe("50b8de4b8801d1c9fa55eb44ff678cd1b3370691")
		expect(res.data?.github.owner).toBe("kunkunsh")
		expect(res.data?.rekorLogIndex).toBe("163394172")
		expect(res.data?.github.repo).toBe("kunkun-ext-ossinsight")
	})

	test("Extension without provenance", async () => {
		expect(
			(
				await validateNpmPackageAsKunkunExtension({
					pkgName: "tauri-plugin-clipboard-api",
					version: "2.1.11",
					githubUsername: "huakunshen"
				})
			).error
		).toBe("Package doesn't have provenance, not signed by github action")
	})

	test("Extension with wrong github username", async () => {
		expect(
			(
				await validateNpmPackageAsKunkunExtension({
					pkgName: "kunkun-ext-ossinsight",
					version: "0.0.4",
					githubUsername: "huakun"
				})
			).error
		).toBe(
			"You (huakun) are not authorized to publish this package. Only kunkunsh or its organization members can publish it."
		)
	})

	test("Non existing package", async () => {
		expect(
			(
				await validateNpmPackageAsKunkunExtension({
					pkgName: "@kksh/non-existing-package",
					version: "0.0.1",
					githubUsername: "huakunshen"
				})
			).error
		).toBe("Package does not exist")
	})
})
