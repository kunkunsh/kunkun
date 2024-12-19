import fs from "fs"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"
import { $ } from "bun"

// skip this if on Windows, protoc-gen-ts is not supported
if (os.platform() === "win32") {
	console.log("Skipping build on Windows")
	process.exit(0)
}
console.log("process.env.CF_PAGES", Bun.env.CF_PAGES)
console.log("process.env.CF_PAGES_URL", Bun.env.CF_PAGES_URL)
console.log("process.env.CF_PAGES_BRANCH", Bun.env.CF_PAGES_BRANCH)
console.log("process.env.CF_PAGES_COMMIT_SHA", Bun.env.CF_PAGES_COMMIT_SHA)
if (Bun.env.CF_PAGES_URL) {
	console.log("Skipping build in Cloudflare Pages, as cloudflare pages does not have protoc")
	process.exit(0)
}

const filepath = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filepath)

const srcPath = path.join(__dirname, "src")
if (!fs.existsSync(srcPath)) {
	fs.mkdirSync(srcPath)
}

fs.rmSync(path.join(__dirname, "src/protos"), { recursive: true, force: true })
const protosDir = path.join(__dirname, "protos")
// find path to protoc command
const protocPath = Bun.which("protoc")
if (!protocPath) {
	throw new Error("protoc not found")
}
for (const file of fs.readdirSync(protosDir)) {
	if (file.endsWith(".proto")) {
		try {
			await $`${protocPath} --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts --ts_out=./src -I . ./protos/${file}`
		} catch (error) {
			console.error(error)
		}
	}
}
