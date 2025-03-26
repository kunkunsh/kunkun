import { sql } from "drizzle-orm"
import {
	blob,
	foreignKey,
	integer,
	numeric,
	primaryKey,
	sqliteTable,
	text
} from "drizzle-orm/sqlite-core"

export const schemaVersion = sqliteTable("schema_version", {
	version: integer().notNull()
})

export const extensions = sqliteTable("extensions", {
	extId: integer("ext_id").primaryKey({ autoIncrement: true }),
	identifier: text().notNull(),
	version: text().notNull(),
	enabled: numeric().default(sql`(TRUE)`),
	path: text(),
	data: numeric(),
	installedAt: numeric("installed_at").default(sql`(CURRENT_TIMESTAMP)`)
})

export const commands = sqliteTable("commands", {
	cmdId: integer("cmd_id").primaryKey({ autoIncrement: true }),
	extId: integer("ext_id")
		.notNull()
		.references(() => extensions.extId, { onDelete: "cascade" }),
	name: text().notNull(),
	enabled: integer({ mode: "boolean" }),
	// enabled: numeric().default(sql`(TRUE)`),
	alias: text(),
	hotkey: text(),
	type: text().notNull(),
	data: numeric()
})

export const extensionData = sqliteTable("extension_data", {
	dataId: integer("data_id").primaryKey({ autoIncrement: true }),
	extId: integer("ext_id")
		.notNull()
		.references(() => extensions.extId, { onDelete: "cascade" }),
	dataType: text("data_type").notNull(),
	// data: text({ mode: "json" }).notNull(),
	// metadata: text({ mode: "json" }),
	data: text("data").notNull(),
	metadata: text("metadata"),
	searchText: text("search_text"),
	createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: numeric("updated_at").default(sql`(CURRENT_TIMESTAMP)`)
})

export const extensionDataFts = sqliteTable("extension_data_fts", {
	dataId: numeric("data_id"),
	searchText: numeric("search_text"),
	extensionDataFts: numeric("extension_data_fts"),
	rank: numeric()
})

export const extensionDataFtsData = sqliteTable("extension_data_fts_data", {
	id: integer().primaryKey(),
	block: blob()
})

export const extensionDataFtsIdx = sqliteTable(
	"extension_data_fts_idx",
	{
		segid: numeric().notNull(),
		term: numeric().notNull(),
		pgno: numeric()
	},
	(table) => [
		primaryKey({ columns: [table.segid, table.term], name: "extension_data_fts_idx_segid_term_pk" })
	]
)

export const extensionDataFtsDocsize = sqliteTable("extension_data_fts_docsize", {
	id: integer().primaryKey(),
	sz: blob()
})

export const extensionDataFtsConfig = sqliteTable("extension_data_fts_config", {
	k: numeric().primaryKey().notNull(),
	v: numeric()
})
