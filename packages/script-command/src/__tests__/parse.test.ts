import { describe, expect, test } from "bun:test"
import * as v from "valibot"
import { ScriptCommandConfig } from "../models"
import { parseScriptCommand } from "../parser"

describe("parseScriptCommand", () => {
	test("should parse script command", async () => {
		for (const filePath of [
			"./samples/raycast/python.py",
			"./samples/raycast/node.js",
			"./samples/raycast/ruby.rb",
			"./samples/raycast/bash.sh",
			// kunkun
			"./samples/kunkun/python.py",
			"./samples/kunkun/node.js",
			"./samples/kunkun/ruby.rb",
			"./samples/kunkun/bash.sh"
		]) {
			const content = await Bun.file(filePath).text()
			const scriptCommand = parseScriptCommand(
				content,
				filePath.split(".").pop() as "py" | "js" | "ts" | "swift" | "scpt"
			)
			expect(v.is(ScriptCommandConfig, scriptCommand)).toBe(true)
		}
	})
})
