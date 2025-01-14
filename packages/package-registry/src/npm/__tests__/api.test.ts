import { describe, expect, test } from "bun:test"
import * as v from "valibot"
import {
	getFullNpmPackageInfo,
	getNpmPackageInfoByVersion,
	getNpmPackageTarballUrl,
	getNpmPkgProvenance,
	listPackagesOfMaintainer,
	listPackagesOfScope,
	npmPackageExists,
	validateNpmPackageAsKunkunExtension
} from ".."
import { getTarballSize } from "../../utils"
import { NpmPkgMetadata, NpmPkgVersionMetadata, NpmSearchResultObject, Provenance } from "../models"

describe("NPM API", () => {
	const testPackages: string[] = [
		"react",
		"axios",
		"express",
		"@tauri-apps/api",
		"tauri-plugin-clipboard-api"
	]
	test("get full npm package info", async () => {
		for (const pkg of testPackages) {
			const parsed = v.safeParse(NpmPkgMetadata, await getFullNpmPackageInfo(pkg))
			if (!parsed.success) {
				console.log(v.flatten(parsed.issues))
			}
		}
	})

	test("get npm package version info", async () => {
		for (const pkg of testPackages) {
			v.parse(NpmPkgVersionMetadata, await getNpmPackageInfoByVersion(pkg, "latest"))
		}
	})

	test("get npm package provenance", async () => {
		const provenance = await getNpmPkgProvenance("axios", "1.7.9")
		expect(provenance).toBeDefined()
		v.parse(Provenance, provenance)
	})

	test("list packages of maintainer", async () => {
		const packages = await listPackagesOfMaintainer("huakunshen")
		v.parse(v.array(NpmSearchResultObject), packages)
		expect(packages.length).toBeGreaterThan(0)
	})

	test("list packages of scope", async () => {
		const packages = await listPackagesOfScope("kksh")
		v.parse(v.array(NpmSearchResultObject), packages)
		expect(packages.length).toBeGreaterThan(0)
	})

	test("npm package exists", async () => {
		expect(await npmPackageExists("kunkun-ext-ossinsight", "0.0.1")).toBe(true)
		expect(await npmPackageExists("kunkun-ext-non-existing", "0.0.1")).toBe(false)
	})
})
