/**
 * This is a E2E test, create every template from production build and run `npm install` and `npm run build`
 * When running `npm install` with bun shell, it fails in bun test environment, so I simply run everything as regular ts without test()
 */
import os from "os"
import path from "path"
import { $ } from "bun"
import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import fs from "fs-extra"
import { getRootDir } from "../src/constants"

const testDir = path.join(os.tmpdir(), "kunkun-create-kunkun-test")
console.log("Test Dir: ", testDir)
const distDir = path.join(getRootDir(), "dist")
const indexjsPath = path.join(distDir, "index.mjs")
const templateNames = ["template", "react", "vue", "nuxt", "svelte", "sveltekit"]

fs.rmdirSync(testDir, { recursive: true })
fs.mkdirpSync(testDir)
await Promise.all(
	templateNames.map(async (templateName) => {
		const folderName = `${templateName}-ext`
		await $`node ${indexjsPath} --outdir ${testDir} --name ${folderName} --template ${templateName}`
		const templateDir = path.join(testDir, folderName)
		await $`rm -rf node_modules`.cwd(templateDir).text() // this doesn't work within bun test
		await $`pnpm install`.cwd(templateDir).text() // this doesn't work within bun test
		await $`pnpm run build`.cwd(templateDir).text()
	})
)

test("Build Artifact Existence", () => {
	templateNames.forEach(async (templateName) => {
		const expectedOutDir = templateName === "sveltekit" ? "build" : "dist"
		const folderName = `${templateName}-ext`
		const templateDir = path.join(testDir, folderName)
		expect(fs.existsSync(path.join(templateDir, expectedOutDir))).toBeTrue()
	})
})

afterAll(() => {
	fs.rmdirSync(testDir, { recursive: true })
})
