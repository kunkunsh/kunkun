import { describe, expect, test } from "bun:test"
import * as v from "valibot"
import { ExtPackageJson } from "../../../../api/src/models/manifest"
import { NpmPkgMetadata } from "../../npm/models"
import {
	getAllVersionsOfJsrPackage,
	getJsrNpmPackageVersionMetadata,
	getJsrNpmPkgMetadata,
	getJsrPackageGitHubRepo,
	getJsrPackageHtml,
	getJsrPackageMetadata,
	getJsrPackageSrcFile,
	getNpmPackageTarballUrl,
	isSignedByGitHubAction,
	jsrPackageExists,
	splitRawJsrPkgName,
	translateJsrToNpmPkgName
} from "../index"
import { JsrPackageMetadata } from "../models"

describe("Test the helper functions", () => {
	test("Get Package Html", async () => {
		const html = await getJsrPackageHtml("kunkun", "kkrpc")
		expect(html).toBeDefined()
	})

	test("Signed By GitHub Action", async () => {
		const kkrpcSigned = await isSignedByGitHubAction("kunkun", "kkrpc", "0.0.14")
		expect(kkrpcSigned).toBe(true)
		const kkrpcSignedVersion = await isSignedByGitHubAction("kunkun", "kkrpc", "0.0.14")
		expect(kkrpcSignedVersion).toBe(true)
		expect(kkrpcSignedVersion).toBe(true)
		const kunkunApiSigned = await isSignedByGitHubAction("kunkun", "api", "0.0.47")
		expect(kunkunApiSigned).toBe(false)
	})

	test("Get Linked GitHub Repo", async () => {
		const repo = await getJsrPackageGitHubRepo("kunkun", "kkrpc")
		expect(repo).toBeDefined()
		expect(repo?.owner).toBe("kunkunsh")
		expect(repo?.name).toBe("kkrpc")
	})

	test("Get Package Metadata", async () => {
		const metadata = await getJsrPackageMetadata("kunkun", "api")
		const parsed = v.parse(JsrPackageMetadata, metadata)
		expect(parsed).toBeDefined()
	})

	test("Get Package's package.json", async () => {
		const packageJson = await getJsrPackageSrcFile(
			"kunkun",
			"ext-image-processing",
			"0.0.6",
			"package.json"
		)
		expect(packageJson).toBeDefined()
		const parsed = v.parse(ExtPackageJson, JSON.parse(packageJson!))
		expect(parsed).toBeDefined()
	})

	test("Get Package's README.md", async () => {
		const readme = await getJsrPackageSrcFile("kunkun", "api", "0.0.47", "README.md")
		expect(readme).toBeDefined()
	})

	test("Translate Jsr Package Name to Npm Package Name", () => {
		const npmPkgName = translateJsrToNpmPkgName("kunkun", "api")
		expect(npmPkgName).toBe("kunkun__api")
	})

	test("Split Jsr Package Name", async () => {
		const { scope, name } = await splitRawJsrPkgName("@kunkun/api")
		expect(scope).toBe("kunkun")
		expect(name).toBe("api")
		expect(splitRawJsrPkgName("kunkun/api")).rejects.toThrow()
	})

	test("Get Npm Package Metadata", async () => {
		const metadata = await getJsrNpmPkgMetadata("kunkun", "api")
		const parsed = v.safeParse(NpmPkgMetadata, metadata)
		if (!parsed.success) {
			console.log(v.flatten(parsed.issues))
			throw new Error("Failed to parse NpmPkgMetadata")
		}
		expect(parsed.output).toBeDefined()
	})

	test("Get Npm Package Version Metadata", async () => {
		const metadata = await getJsrNpmPackageVersionMetadata("kunkun", "api", "0.0.47")
		expect(metadata).toBeDefined()
	})

	test("Get Npm Package Tarball Url", async () => {
		const url = await getNpmPackageTarballUrl("kunkun", "api", "0.0.47")
		expect(url).toBeDefined()
	})

	test("Get All Versions Of Jsr Package", async () => {
		const versions = await getAllVersionsOfJsrPackage("kunkun", "api")
		expect(versions).toBeDefined()
		// verify: versions should match npm api
		const npmPkgMetadata = await getJsrNpmPkgMetadata("kunkun", "api")
		expect(versions).toEqual(Object.keys(npmPkgMetadata.versions))
	})

	test("Jsr Package Exists", async () => {
		expect(await jsrPackageExists("kunkun", "api")).toBe(true)
		expect(await jsrPackageExists("hk", "non-existent-package")).toBe(false)
		expect(await jsrPackageExists("hk", "jsr-client", "0.1.2")).toBe(true)
		expect(await jsrPackageExists("hk", "jsr-client", "0.1.500")).toBe(false)
	})
})
