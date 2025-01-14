import { describe, expect, test } from "bun:test"
import { validateJsrPackageAsKunkunExtension } from "../index"

describe("Validate Jsr package as Kunkun extension", () => {
	test("Package not signed by GitHub Actions", async () => {
		expect(
			(
				await validateJsrPackageAsKunkunExtension({
					jsrPackage: {
						scope: "kunkun",
						name: "api",
						version: "0.0.47"
					},
					githubUsername: "kunkunsh"
				})
			).error
		).toBe("JSR package is not signed by GitHub Actions")
	})

	test("Non-existent package", async () => {
		expect(
			(
				await validateJsrPackageAsKunkunExtension({
					jsrPackage: {
						scope: "kunkun",
						name: "non-existent-package",
						version: "0.0.47"
					},
					githubUsername: "kunkunsh"
				})
			).error
		).toBe("JSR package does not exist")
	})

	test("Package not linked to a GitHub repository", async () => {
		expect(
			(
				await validateJsrPackageAsKunkunExtension({
					jsrPackage: {
						scope: "hk",
						name: "tauri-plugin-network-api",
						version: "2.0.3-beta.1"
					},
					githubUsername: "kunkunsh"
				})
			).error
		).toBe("JSR package is not linked to a GitHub repository")
	})

	test("GitHub repository owner does not match JSR package owner", async () => {
		const res = await validateJsrPackageAsKunkunExtension({
			jsrPackage: {
				scope: "kunkun",
				name: "ext-image-processing",
				version: "0.0.18"
			},
			githubUsername: "Huakun"
		})
		expect(res.error).toBe(
			"You (Huakun) are not authorized to publish this package. Only kunkunsh or its organization members can publish it."
		)
	})

	test("A valid extension package", async () => {
		const res = await validateJsrPackageAsKunkunExtension({
			jsrPackage: {
				scope: "kunkun",
				name: "ext-image-processing",
				version: "0.0.18"
			},
			githubUsername: "HuakunShen"
		})
		expect(res.data).toBeDefined()
		expect(res.data?.github.commit).toBe("4db8d65b5e3fa115da6e31bd945f5c610c4a21cb")
		expect(res.data?.github.owner).toBe("kunkunsh")
		expect(res.data?.github.repo).toBe("kunkun-ext-image-processing")
	})
})
