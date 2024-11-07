import { db } from "@kksh/api/commands"
import { CmdTypeEnum, ExtPackageJson, ExtPackageJsonExtra } from "@kksh/api/models"

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

export async function createQuickLinkCommand(name: string, link: string) {
	const extension = await db.getExtQuickLinks()
	return db.createCommand({
		extId: extension.extId,
		name,
		cmdType: CmdTypeEnum.QuickLink,
		data: link,
		enabled: true
	})
}

export async function getAllQuickLinkCommands() {
	const extension = await db.getExtQuickLinks()
	const cmds = await db.getCommandsByExtId(extension.extId)
	return cmds
}
