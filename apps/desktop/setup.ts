import assert from "assert"
import { compressString, decompressString } from "@kksh/utils"
import { $ } from "bun"

/* -------------------------------------------------------------------------- */
/*                             Download Dance JSON                            */
/* -------------------------------------------------------------------------- */
console.log("Downloading Dance Data...")
const rawData = await fetch("https://dance.kunkun.sh/api/data").then((res) => res.text())

function formatFileSize(size: number) {
	return `${(size / 1024).toFixed(2)} KB`
}
Bun.write("./src/data/dance.json", rawData)
console.log(`Raw Data Size: ${formatFileSize(rawData.length)}`)
const compressedDance = compressString(rawData)
const decompressedDance = decompressString(compressedDance)
assert(decompressedDance === rawData)
const filePath = "./src/data/dance.bin"

Bun.write(
	filePath, // has to be .txt in order to be imported as text
	compressedDance
)
// get file size
const fileSize = Bun.file(filePath).size
console.log(`Dance Data Compressed File Size: ${formatFileSize(fileSize)}`)
