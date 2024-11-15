import path from "path"
import { fileURLToPath } from "url"
import { version } from "../package.json"

export const NODE_ENV = process.env.NODE_ENV ?? "development"
export const isProduction = NODE_ENV === "production"
export function getRootDir() {
	const __filename = fileURLToPath(import.meta.url)
	const __dirname = path.dirname(__filename)
	return isProduction ? __dirname : path.dirname(__dirname)
}
export function getTemplateRoot() {
	return isProduction
		? path.join(getRootDir(), "templates")
		: path.join(getRootDir(), "../../templates")
}

export const createKunkunVersion = version
