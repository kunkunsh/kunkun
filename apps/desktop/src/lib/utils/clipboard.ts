import { proxyDB, schema } from "@kksh/drizzle"
import { getExtClipboard } from "@kksh/drizzle/api"
import { error, info } from "@tauri-apps/plugin-log"
import * as orm from "drizzle-orm"

/**
 * For now, simply delete all clipboard data older than 10 days
 */
export async function cleanClipboard() {
	const clipboardExt = await getExtClipboard()
	const tenDaysAgo = new Date()
	tenDaysAgo.setDate(tenDaysAgo.getDate() - 8)

	try {
		// Select data older than 10 days to check what will be deleted
		const oldClipboardData = await proxyDB
			.select({ count: orm.count() })
			.from(schema.extensionData)
			.where(
				orm.and(
					orm.eq(schema.extensionData.extId, clipboardExt.extId),
					orm.lt(schema.extensionData.createdAt, tenDaysAgo.toISOString())
				)
			)
		const nLinesToDelete = oldClipboardData.at(0)?.count ?? 0
		info(`Found ${nLinesToDelete} clipboard entries older than 10 days to clean up`)

		// Now delete the old data
		const deleted = await proxyDB
			.delete(schema.extensionData)
			.where(
				orm.and(
					orm.eq(schema.extensionData.extId, clipboardExt.extId),
					orm.lt(schema.extensionData.createdAt, tenDaysAgo.toISOString())
				)
			)

		console.log("deleted", deleted)
	} catch (e) {
		error(`Error during clipboard cleanup: ${e}`)
	}
}
