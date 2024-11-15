import { $ } from "bun"
import fs from "fs-extra"

process.env.NODE_ENV = "production"

if (Bun.env.NODE_ENV !== "production") {
	console.error("This script should be run in production mode. Set NODE_ENV=production.")
	process.exit(1)
}

await $`rm -rf dist`
// building with bun doesn't work with debug
fs.mkdirSync("./dist")
process.env.NODE_ENV = "production"
await Bun.build({
	entrypoints: ["./cli.ts"],
	outdir: "./dist",
	target: "node",
	// minify: true,
	format: "esm"
})

// await $`bun build --target node cli.ts > dist/cli.js`
fs.cpSync("./src/docker", "./dist/docker", { recursive: true })
