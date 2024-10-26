import fs from "fs"
import path from "path"
import { PACKAGES_PATHS } from "@kksh/ci/index"
import { expect, test } from "bun:test"
import { safeParse } from "valibot"
import { ExtPackageJson } from "../manifest"

test("Load and parse every extension in this repo", () => {
	// iterate over all extensions in extensionsDir, parse package.json
	;[PACKAGES_PATHS.EXTENSIONS, PACKAGES_PATHS.TEMPLATES].forEach((dir) => {
		fs.readdirSync(dir).forEach((extDirName) => {
			const extDir = path.join(dir, extDirName)
			const packageJsonPath = path.join(extDir, "package.json")
			console.log(packageJsonPath)
			if (!fs.existsSync(packageJsonPath)) {
				return
			}
			// read package.json

			const pkgJsonContent = fs.readFileSync(packageJsonPath, "utf-8")
			const pkgJson = JSON.parse(pkgJsonContent)
			// validate package.json
			// const result = parse(ExtPackageJson, pkgJson)
			const parse = safeParse(ExtPackageJson, pkgJson)
			if (parse.issues) {
				console.log(parse.issues)
			}
			expect(parse.success).toBe(true)
		})
	})
})
