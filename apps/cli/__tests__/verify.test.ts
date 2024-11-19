import path from "path"
import { getRootDir } from "@/constants"
import { expect, test } from "bun:test"
import fs from "fs-extra"
import { verifyCmd } from "../src/commands/verify"

const rootDir = getRootDir()
const extensionsDir = path.join(rootDir, "../../packages/extensions")
const templatesDir = path.join(rootDir, "../../packages/templates")

const extsPaths = fs
	.readdirSync(extensionsDir)
	.map((extensionName) => path.join(extensionsDir, extensionName))
	.filter((extPath) => fs.statSync(extPath).isDirectory())
const templatesPaths = fs
	.readdirSync(templatesDir)
	.map((templateName) => path.join(templatesDir, templateName))
	.filter((extPath) => fs.statSync(extPath).isDirectory())

test("Verify Extensions", () => {
	for (const extPath of extsPaths) {
		expect(verifyCmd(extPath, false)).toBeTrue()
	}
})

// test("Verify Templates", () => {
// 	for (const templatePath of templatesPaths) {
// 		expect(verifyCmd(templatePath, false)).toBeTrue()
// 	}
// })
