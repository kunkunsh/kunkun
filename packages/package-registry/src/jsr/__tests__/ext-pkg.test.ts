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
				version: "0.0.20"
			},
			githubUsername: "HuakunShen"
		})
		expect(res.data).toBeDefined()
		expect(res.data?.rekorLogIndex).toBe("163385336")
		expect(res.data?.github.commit).toBe("56fb480efbcb4497fa5483d4a660a82f83dc8ac3")
		expect(res.data?.github.owner).toBe("kunkunsh")
		expect(res.data?.github.repo).toBe("kunkun-ext-image-processing")
		// expect(res.data?.github.githubActionInvocationId).toBe("48b7dff528bc6a175ce9ee99e6d8de0c718e70a0")
	})
})
