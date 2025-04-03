import { proxyDB } from "@kksh/drizzle"
import { error, info } from "@tauri-apps/plugin-log"
import { sql } from "drizzle-orm"

export async function vacuumSqlite() {
	const statement = sql`VACUUM`
	try {
		await proxyDB.run(statement)
		info("Vacuumed sqlite")
	} catch (error) {
		console.error(`Failed to vacuum sqlite: ${error}`)
	}
}
