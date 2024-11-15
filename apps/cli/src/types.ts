import type { ExtPackageJson } from "@kksh/api/models"

export type BuildResult = {
	shasum: string
	tarballFilename: string
	tarballPath: string
	extPath: string
	pkg: ExtPackageJson
}
