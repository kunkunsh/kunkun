/* eslint-disable @typescript-eslint/no-explicit-any */
import { db as dbCmd } from "@kksh/api/commands"
import * as schema from "../drizzle/schema"
import { error } from "@tauri-apps/plugin-log"
import { drizzle } from "drizzle-orm/sqlite-proxy"

/**
 * Loads the sqlite database via the Tauri Proxy.
 */
// export const sqlite = await Database.load("sqlite:test.db");

/**
 * The drizzle database instance.
 */
export const db = drizzle<typeof schema>(
    async (sql, params, method) => {
        let rows: any = []
        let results = []
        console.log({
            sql,
            params,
            method
        })
        console.log(sql)
        // If the query is a SELECT, use the select method
        if (isSelectQuery(sql)) {
            rows = await dbCmd.select(sql, params).catch((e) => {
                error("SQL Error:", e)
                return []
            })
        } else {
            // Otherwise, use the execute method
            rows = await dbCmd.execute(sql, params).catch((e) => {
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
