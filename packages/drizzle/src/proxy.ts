/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from "@kksh/api/commands"
import { error } from "@tauri-apps/plugin-log"
import { drizzle } from "drizzle-orm/sqlite-proxy"
import * as schema from "../drizzle/schema"

/**
 * The drizzle database instance.
 */
export const db = drizzle<typeof schema>(
	async (sqlQuery, params, method) => {
		let rows: any = []
		let results = []
		// console.log({
		// 	sql: sqlQuery,
		// 	params,
		// 	method
		// })
		// console.log(sqlQuery)
		// If the query is a SELECT, use the select method
		if (isSelectQuery(sqlQuery)) {
			rows = await sql.select(sqlQuery, params).catch((e) => {
				error("SQL Error:", e)
				return []
			})
		} else {
			// Otherwise, use the execute method
			rows = await sql.execute(sqlQuery, params).catch((e) => {
				error("SQL Error:", e)
				return []
			})
			return { rows: [] }
		}

		rows = rows.map((row: any) => {
			return Object.values(row)
		})

		// If the method is "all", return all rows
		results = method === "all" ? rows : rows[0]
		return { rows: results }
	},
	// Pass the schema to the drizzle instance
	{ schema: schema, logger: true }
)

/**
 * Checks if the given SQL query is a SELECT query.
 * @param sql The SQL query to check.
 * @returns True if the query is a SELECT query, false otherwise.
 */
function isSelectQuery(sql: string): boolean {
	const selectRegex = /^\s*SELECT\b/i
	return selectRegex.test(sql)
}
