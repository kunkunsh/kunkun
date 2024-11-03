import fs from "fs"
import { $ } from "bun"

// add package version

if (fs.existsSync("dist")) {
	await $`rm -rf dist`
}
fs.mkdirSync("dist")
// await $`pnpm build:rollup`
// await $`cp ../schema/manifest-json-schema.json ./dist/schema.json`
await $`bun ../schema/scripts/print-schema.ts > dist/schema.json`

// Post Build Verify
const schemaFile = Bun.file("dist/schema.json")
if (!schemaFile.exists()) {
	throw new Error("schema.json not found")
}

await $`bun patch-version.ts`
