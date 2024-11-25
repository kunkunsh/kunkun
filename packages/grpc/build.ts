import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { $ } from "bun"

await $`rm -rf ./src/protos`
const filepath = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filepath)
const protosDir = path.join(__dirname, "protos")
for (const file of fs.readdirSync(protosDir)) {
	if (file.endsWith(".proto")) {
		await $`
        protoc \
        --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
        --ts_out=./src \
        -I . \
        ./protos/${file}`
	}
}
