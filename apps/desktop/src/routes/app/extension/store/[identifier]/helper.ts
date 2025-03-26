import type { ExtPublishMetadata } from "@kunkunapi/src/models"

export async function getInstallExtras(
	extMetadata?: {
		sourceType?: string
		source?: string
	}
): Promise<{ overwritePackageJson?: string }> {
	const extras: { overwritePackageJson?: string } = {}
	if (extMetadata?.sourceType) {
		if (extMetadata?.sourceType === "jsr") {
			if (extMetadata?.source) {
				try {
					const res = await fetch(`${extMetadata.source}/package.json`)
					const pkgJsonContent = await res.text()
					extras.overwritePackageJson = pkgJsonContent
				} catch (error) {
					console.error("Fail to fetch jsr package.json", error)
				}
			}
		}
	}
	return extras
}
