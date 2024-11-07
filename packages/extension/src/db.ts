import { db } from "@kksh/api/commands"
import {
	CmdTypeEnum,
	ExtCmd,
	ExtPackageJson,
	ExtPackageJsonExtra,
	Icon,
	QuickLinkCmd
} from "@kksh/api/models"
import * as v from "valibot"

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

export async function createQuickLinkCommand(name: string, link: string, icon: Icon) {
	const extension = await db.getExtQuickLinks()
	return db.createCommand({
		extId: extension.extId,
		name,
		cmdType: CmdTypeEnum.QuickLink,
		data: JSON.stringify({
			link,
			icon
		}),
		enabled: true
	})
}

export async function getAllQuickLinkCommands(): Promise<QuickLinkCmd[]> {
	const extension = await db.getExtQuickLinks()
	const cmds = await db.getCommandsByExtId(extension.extId)
	return cmds
		.map((cmd) => {
			try {
				cmd.data = JSON.parse(cmd.data)
				const parsedData = v.safeParse(QuickLinkCmd, cmd)
				if (!parsedData.success) {
					console.warn("Fail to parse quick link command", cmd)
					console.error(v.flatten(parsedData.issues))
					return null
				}
				return parsedData.output
			} catch (error) {
				return null
			}
		})
		.filter((cmd) => cmd !== null)
}
