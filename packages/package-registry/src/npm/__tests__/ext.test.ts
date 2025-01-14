import { describe, expect, test } from "bun:test"
import { validateNpmPackageAsKunkunExtension } from ".."

describe("validate kunkun extension", () => {
	test("A working extension", async () => {
		const res = await validateNpmPackageAsKunkunExtension({
			pkgName: "kunkun-ext-ossinsight",
			version: "0.0.1",
			githubUsername: "huakunshen"
		})
		expect(res.error).toBeUndefined()
		expect(res.data?.commit).toBe("8af7eced43a5d240fa3390c7e297178ecb63c344")
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
					version: "0.0.1",
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
