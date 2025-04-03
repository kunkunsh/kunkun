import { proxyDB, schema } from "@kksh/drizzle"
import { getExtClipboard } from "@kksh/drizzle/api"
import { error, info } from "@tauri-apps/plugin-log"
import * as orm from "drizzle-orm"

/**
 * For now, simply delete all clipboard data older than 10 days
 */
export async function cleanClipboard() {
	const nDays = 10
	const clipboardExt = await getExtClipboard()
	const nDaysAgo = new Date()
	nDaysAgo.setDate(nDaysAgo.getDate() - nDays)

	try {
		// Select data older than 10 days to check what will be deleted
		const oldClipboardData = await proxyDB
			.select({ count: orm.count() })
			.from(schema.extensionData)
			.where(
				orm.and(
					orm.eq(schema.extensionData.extId, clipboardExt.extId),
					orm.lt(schema.extensionData.createdAt, nDaysAgo.toISOString())
				)
			)
		const nLinesToDelete = oldClipboardData.at(0)?.count ?? 0
		console.info(`Found ${nLinesToDelete} clipboard entries older than ${nDays} days to clean up`)
		info(`Found ${nLinesToDelete} clipboard entries older than ${nDays} days to clean up`)

		// Now delete the old data
		const deleted = await proxyDB
			.delete(schema.extensionData)
			.where(
				orm.and(
					orm.eq(schema.extensionData.extId, clipboardExt.extId),
					orm.lt(schema.extensionData.createdAt, nDaysAgo.toISOString())
				)
			)

		console.log("deleted", deleted)
	} catch (e) {
		error(`Error during clipboard cleanup: ${e}`)
	}
}
