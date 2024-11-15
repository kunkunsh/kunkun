import path from "path"
import { fileURLToPath } from "url"

const filepath = fileURLToPath(import.meta.url)
const filename = path.basename(filepath)
const __dirname = path.dirname(filepath)
const isInJs = filename.endsWith(".js")

function inferNodeEnv() {
	if (isInJs) {
		return "production"
	}
	if (process.env.NODE_ENV) {
		return process.env.NODE_ENV
	}
	return "development"
}

export const NODE_ENV = inferNodeEnv()

export function getRootDir() {
	return isInJs ? __dirname : path.dirname(__dirname)
}

export function getDockerFolder() {
	return isInJs ? path.join(getRootDir(), "docker") : path.join(getRootDir(), "src/docker")
}

export function getDockerEntrypoint() {
	return path.join(getDockerFolder(), "entrypoint.sh")
}
