import fs from "fs"

// run the following only on windows

const OPENSSL_DIR = process.env.OPENSSL_DIR
const OPENSSL_INCLUDE_DIR = process.env.OPENSSL_INCLUDE_DIR
const OPENSSL_LIB_DIR = process.env.OPENSSL_LIB_DIR

console.log("OPENSSL_DIR", OPENSSL_DIR)
console.log("OPENSSL_INCLUDE_DIR", OPENSSL_INCLUDE_DIR)
console.log("OPENSSL_LIB_DIR", OPENSSL_LIB_DIR)

if (process.platform === "win32") {
	// check if each directory exists
	if (!OPENSSL_DIR || !OPENSSL_INCLUDE_DIR || !OPENSSL_LIB_DIR) {
		console.error("OPENSSL_DIR, OPENSSL_INCLUDE_DIR, or OPENSSL_LIB_DIR is not set")
		process.exit(1)
	}
	const programFilesDir = "C:\\Program Files"
	console.log(
		`Program Files Directory (${programFilesDir}) Exists: ${fs.existsSync(programFilesDir)}`
	)
	console.log("Program Files Directory Contents:")
	for (const dir of fs.readdirSync(programFilesDir)) {
		console.log(dir)
	}

	console.log(`OPENSSL_DIR (${OPENSSL_DIR}) Exists: ${fs.existsSync(OPENSSL_DIR)}`)
	console.log(
		`OPENSSL_INCLUDE_DIR (${OPENSSL_INCLUDE_DIR}) Exists: ${fs.existsSync(OPENSSL_INCLUDE_DIR)}`
	)
	console.log(`OPENSSL_LIB_DIR (${OPENSSL_LIB_DIR}) Exists: ${fs.existsSync(OPENSSL_LIB_DIR)}`)
} else if (process.platform === "darwin") {
	if (OPENSSL_DIR) {
		if (fs.existsSync(OPENSSL_DIR)) {
			console.log("OPENSSL_DIR exists", OPENSSL_DIR)
		} else {
			console.log("OPENSSL_DIR does not exist", OPENSSL_DIR)
		}
	}
} else if (process.platform === "linux") {
}
