import fs from "fs"
import { toJsonSchema } from "@valibot/to-json-schema"
import { $ } from "bun"
import * as v from "valibot"
import { ExtPackageJson } from "./src/models"

// add package version

if (fs.existsSync("dist")) {
	await $`rm -rf dist`
}
fs.mkdirSync("dist")

await $`bun patch-version.ts`

// run tsup
await $`bun tsup`
// await $`pnpm build:rollup`
// await $`cp ../schema/manifest-json-schema.json ./dist/schema.json`
// await $`bun ../schema/scripts/print-schema.ts > dist/schema.json`

function getJsonSchema(schema: v.ObjectSchema<any, any>) {
	return JSON.stringify(toJsonSchema(v.objectWithRest(schema.entries, v.any())), null, 2)
}
Bun.write("dist/schema.json", getJsonSchema(ExtPackageJson))
// Post Build Verify
const schemaFile = Bun.file("dist/schema.json")
if (!schemaFile.exists()) {
	throw new Error("schema.json not found")
}
