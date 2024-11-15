import os from "os"
import path from "path"
import { getRootDir } from "@/constants"
import type { BuildResult } from "@/types"
import { buildWithDockerAndValidate } from "@/utils"
import { $ } from "bun"
import { afterAll, expect, test } from "bun:test"
import fs from "fs-extra"
import { verifyCmd } from "../src/commands/verify"

const rootDir = getRootDir()
const createKKDir = path.join(rootDir, "../create-kunkun")

const createKKDistDir = path.join(createKKDir, "dist")
const createKKIndexjsPath = path.join(createKKDistDir, "index.mjs")
const testDir = path.join(os.tmpdir(), "kunkun-cli-test")
console.log("Test Dir: ", testDir)
const templateNames = ["react", "vue", "nuxt", "svelte", "sveltekit", "next", "template"]

fs.rmdirSync(testDir, { recursive: true })
fs.mkdirpSync(testDir)
const testTemplateDirs: string[] = []
await Promise.all(
	templateNames.map(async (templateName) => {
		const folderName = `${templateName}-ext`
		await $`node ${createKKIndexjsPath} --outdir ${testDir} --name ${folderName} --template ${templateName}`
		const templateDir = path.join(testDir, folderName)
		console.log("templateDir", templateDir)
		await $`pnpm install`.cwd(templateDir).quiet()
		await $`pnpm build`.cwd(templateDir).quiet()
		testTemplateDirs.push(templateDir)
	})
)

test("Build And Verify", async () => {
	for (const templateDir of testTemplateDirs) {
		expect(verifyCmd(templateDir, false)).toBeTrue()
	}
})

const testDirDocker = path.join(os.tmpdir(), "kunkun-cli-test-docker")
fs.rmdirSync(testDirDocker, { recursive: true })
fs.mkdirpSync(testDirDocker)

const templateData: Record<string, { dir: string; buildResult: BuildResult }> = {}

await Promise.all(
	templateNames.map(async (templateName) => {
		const folderName = `${templateName}-ext`
		await $`node ${createKKIndexjsPath} --outdir ${testDirDocker} --name ${folderName} --template ${templateName}`
		const templateDir = path.join(testDirDocker, folderName)
		console.log("templateDir:", templateDir)

		const buildResult = await buildWithDockerAndValidate(templateDir)
		templateData[templateName] = {
			dir: templateDir,
			buildResult
		}
	})
)
console.log(templateData)

test("Template Exist", () => {
	Object.entries(templateData).forEach(async ([templateName, { dir }]) => {
		console.log("Expect dir exist: ", dir)
		expect(fs.existsSync(dir)).toBeTrue()
	})
})

test("Build Result Tarball Exist", () => {
	Object.entries(templateData).forEach(async ([templateName, { buildResult, dir }]) => {
		const expectedTarballPath = path.join(dir, buildResult.tarballFilename)
		expect(fs.existsSync(expectedTarballPath)).toBeTrue()
	})
})

afterAll(() => {
	fs.rmdirSync(testDir, { recursive: true })
	fs.rmdirSync(testDirDocker, { recursive: true })
})
