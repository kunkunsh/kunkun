import type { Tables } from "@kksh/api/supabase/types"
import type { ExtPublishMetadata } from "@kksh/supabase/models"

export async function getInstallExtras(
	ext: Tables<"ext_publish"> & { metadata: ExtPublishMetadata }
): Promise<{ overwritePackageJson?: string }> {
	const extras: { overwritePackageJson?: string } = {}
	if (ext.metadata.sourceType) {
		if (ext.metadata.sourceType === "jsr") {
			if (ext.metadata.source) {
				try {	
					const res = await fetch(`${ext.metadata.source}/package.json`)
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
