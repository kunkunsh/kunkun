import { invoke } from "@tauri-apps/api/core"
import { generateJarvisPluginCommand } from "./common"

export interface QueryResult {
	/** The number of rows affected by the query. */
	rowsAffected: number
	/**
	 * The last inserted `id`.
	 *
	 * This value is not set for Postgres databases. If the
	 * last inserted id is required on Postgres, the `select` function
	 * must be used, with a `RETURNING` clause
	 * (`INSERT INTO todos (title) VALUES ($1) RETURNING id`).
	 */
	lastInsertId?: number
}

export function select(query: string, values: any[]) {
	return invoke<any[]>(generateJarvisPluginCommand("select"), {
		query,
		values
	})
}

export function execute(query: string, values: any[]) {
	return invoke<QueryResult>(generateJarvisPluginCommand("execute"), {
		query,
		values
	})
}
