import { db } from "@kksh/api/commands"
import { ExtPackageJson, ExtPackageJsonExtra } from "@kksh/api/models"

export async function upsertExtension(extPkgJson: ExtPackageJson, extFullPath: string) {
	const extInDb = await db.getUniqueExtensionByIdentifier(extPkgJson.kunkun.identifier)
	if (!extInDb) {
		// create this extension in database
		await db.createExtension({
			identifier: extPkgJson.kunkun.identifier,
			version: extPkgJson.version,
			path: extFullPath
		})
	}
}
