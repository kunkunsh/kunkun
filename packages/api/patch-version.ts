import fs from "fs"
import { version } from "./package.json"

const versionTsContent = fs.readFileSync("./src/version.ts", "utf-8")
const lines: string[] = []
for (const line of versionTsContent.split("\n")) {
	if (line.includes("export const version")) {
		lines.push(`export const version = "${version}"`)
	} else {
		lines.push(line)
	}
}
fs.writeFileSync("./src/version.ts", lines.join("\n"))
