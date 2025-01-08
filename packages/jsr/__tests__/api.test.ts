import { ExtPackageJson } from "@kksh/api/models"
import { expect, test } from "bun:test"
import * as v from "valibot"
import {
	getAllVersionsOfJsrPackage,
	getJsrNpmPkgMetadata,
	getJsrPackageGitHubRepo,
	getJsrPackageHtml,
	getJsrPackageMetadata,
	getJsrPackageSrcFile,
	getNpmPackageTarballUrl,
	isSignedByGitHubAction,
	splitRawJsrPkgName,
	translateJsrToNpmPkgName
} from "../src"
import { JsrPackageMetadata, NpmPkgMetadata } from "../src/models"

test("Get Package Html", async () => {
	const html = await getJsrPackageHtml("kunkun", "kkrpc")
	expect(html).toBeDefined()
})

test("Signed By GitHub Action", async () => {
	const kkrpcSigned = await isSignedByGitHubAction({ scope: "kunkun", name: "kkrpc" })
	expect(kkrpcSigned).toBe(true)
	const kkrpcSignedVersion = await isSignedByGitHubAction({
		scope: "kunkun",
		name: "kkrpc",
		version: "0.0.14"
	})
	expect(kkrpcSignedVersion).toBe(true)
	const kunkunApiSigned = await isSignedByGitHubAction({
		scope: "kunkun",
		name: "api",
		version: "0.0.47"
	})
	expect(kunkunApiSigned).toBe(false)
})

test("Get Linked GitHub Repo", async () => {
	const repo = await getJsrPackageGitHubRepo({ scope: "kunkun", name: "kkrpc" })
	expect(repo).toBeDefined()
	expect(repo?.scope).toBe("kunkunsh")
	expect(repo?.repo).toBe("kkrpc")
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
	const parsed = v.parse(NpmPkgMetadata, metadata)
	expect(parsed).toBeDefined()
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
