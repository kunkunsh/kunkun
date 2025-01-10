import { describe, expect, test } from "bun:test"
import { validateJsrPackageAsKunkunExtension } from "../index"

describe("Validate Jsr package as Kunkun extension", () => {
	test("Package not signed by GitHub Actions", () => {
		expect(
			validateJsrPackageAsKunkunExtension({
				jsrPackage: {
					scope: "kunkun",
					name: "api",
					version: "0.0.47"
				},
				githubUsername: "kunkunsh"
			})
		).rejects.toThrow("JSR package is not signed by GitHub Actions")
	})

	test("Non-existent package", () => {
		expect(
			validateJsrPackageAsKunkunExtension({
				jsrPackage: {
					scope: "kunkun",
					name: "non-existent-package",
					version: "0.0.47"
				},
				githubUsername: "kunkunsh"
			})
		).rejects.toThrow("JSR package does not exist")
	})

	test("Package not linked to a GitHub repository", () => {
		expect(
			validateJsrPackageAsKunkunExtension({
				jsrPackage: {
					scope: "hk",
					name: "tauri-plugin-network-api",
					version: "2.0.3-beta.1"
				},
				githubUsername: "kunkunsh"
			})
		).rejects.toThrow("JSR package is not linked to a GitHub repository")
	})

	test("GitHub repository owner does not match JSR package owner", () => {
		expect(
			validateJsrPackageAsKunkunExtension({
				jsrPackage: {
					scope: "kunkun",
					name: "ext-image-processing",
					version: "0.0.6"
				},
				githubUsername: "kunkunsh" // should be HuakunShen
			})
		).rejects.toThrow("GitHub repository owner does not match JSR package owner")
	})

	test("A valid extension package", async () => {
		expect(
			await validateJsrPackageAsKunkunExtension({
				jsrPackage: {
					scope: "kunkun",
					name: "ext-image-processing",
					version: "0.0.6"
				},
				githubUsername: "HuakunShen"
			})
		).toBe(true)
	})
})
