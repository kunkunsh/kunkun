import { ExtPackageJson } from "@kksh/api/models"
import { describe, expect, it } from "bun:test"
import { getJsonSchema } from "../src"

it("Generate Schema", () => {
	expect(getJsonSchema(ExtPackageJson)).toBeDefined()
})
