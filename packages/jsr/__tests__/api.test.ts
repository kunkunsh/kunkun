import { ExtPackageJson } from "@kksh/api/models"
import { expect, test } from "bun:test"
import * as v from "valibot"
import {
	getAllVersionsOfJsrPackage,
	getJsrNpmPkgMetadata,
	getJsrPackageHtml,
	getJsrPackageMetadata,
	getJsrPackagePackageJson,
	getJsrPackageREADME,
	getNpmPackageTarballUrl,
	signedByGitHubAction,
	splitRawJsrPkgName,
	translateJsrToNpmPkgName
} from "../src"
import { JsrPackageMetadata, NpmPkgMetadata } from "../src/models"

test("Get Package Html", async () => {
	const html = await getJsrPackageHtml("kunkun", "kkrpc")
	expect(html).toBeDefined()
})

test("Signed By GitHub Action", async () => {
	const kkrpcSigned = await signedByGitHubAction("kunkun", "kkrpc")
	expect(kkrpcSigned).toBe(true)
	const kkrpcSignedVersion = await signedByGitHubAction("kunkun", "kkrpc", "0.0.14")
	expect(kkrpcSignedVersion).toBe(true)
	const kunkunApiSigned = await signedByGitHubAction("kunkun", "api", "0.0.47")
	expect(kunkunApiSigned).toBe(false)
})

test("Get Package Metadata", async () => {
	const metadata = await getJsrPackageMetadata("kunkun", "api")
	const parsed = v.parse(JsrPackageMetadata, metadata)
	expect(parsed).toBeDefined()
})

test("Get Package's package.json", async () => {
	const packageJson = await getJsrPackagePackageJson("kunkun", "api", "0.0.47")
	// TODO: parse, after publish a real extension package. api pkg is placeholder for now
	// const parsed = v.parse(ExtPackageJson, packageJson)
	expect(packageJson).toBeDefined()
})

test("Get Package's README.md", async () => {
	const readme = await getJsrPackageREADME("kunkun", "api", "0.0.47")
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
