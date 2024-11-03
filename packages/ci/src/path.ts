import path from "path"
import { fileURLToPath } from "url"

const filepath = fileURLToPath(import.meta.url)
export const REPO_ROOT = path.dirname(path.dirname(path.dirname(path.dirname(filepath))))
export const PACKAGES_PATHS = {
	DESKTOP: path.join(REPO_ROOT, "apps/desktop"),
	CI: path.join(REPO_ROOT, "packages/ci"),
	API: path.join(REPO_ROOT, "packages/api"),
	SCHEMA: path.join(REPO_ROOT, "packages/schema"),
	EXTENSIONS: path.join(REPO_ROOT, "packages/extensions"),
	TEMPLATES: path.join(REPO_ROOT, "packages/templates")
}
