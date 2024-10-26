import path from "path"
import { describe, expect, test } from "bun:test"
import madge from "madge"
import * as v from "valibot"
import { exports } from "../package.json"

const buildEntries: string[] = Object.entries(exports).filter((e) => typeof e === "string")

describe("Verify Bundled Package", () => {
	test("Test Circular Dependency", async () => {
		const pkgRoot = path.join(__dirname, "..")
		const paths = buildEntries.map((p) => path.join(pkgRoot, p)).map((p) => path.resolve(p))
		// expect each paths to exist
		paths.forEach(async (p) => {
			expect(await Bun.file(p).exists()).toBe(true)
			const madgeRes = await madge(p)
			expect(madgeRes.circular()).toEqual([])
		})
	})

	test("Verify Package Export Path", async () => {
		const pkgRoot = path.join(__dirname, "..")
		const pkgJsonPath = path.join(pkgRoot, "package.json")
		const file = Bun.file(pkgJsonPath)
		const pkgJson = await file.json()
		const exports = pkgJson["exports"]
		Object.entries(exports).forEach(async ([key, value]) => {
			const exportPaths = v.parse(v.union([v.record(v.string(), v.string()), v.string()]), value)
			if (typeof exportPaths === "string") {
				// special case for "./package.json"
				const resolvedPath = path.join(pkgRoot, exportPaths)
				expect(await Bun.file(resolvedPath).exists()).toBe(true)
			} else {
				Object.values(exportPaths).forEach(async (_path: string) => {
					const resolvedPath = path.join(pkgRoot, _path)
					expect(await Bun.file(resolvedPath).exists()).toBe(true)
				})
			}
		})
	})
})
