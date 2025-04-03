import { KUNKUN_EXT_IDENTIFIER, type IDb, type IKV } from "@kksh/api"
import {
	CmdType,
	convertDateToSqliteString,
	Ext,
	ExtCmd,
	ExtData,
	SearchMode,
	SearchModeEnum,
	SQLSortOrder,
	SQLSortOrderEnum
} from "@kksh/api/models"
import * as relations from "@kksh/drizzle/relations"
import * as orm from "drizzle-orm"
import type { SelectedFields } from "drizzle-orm/sqlite-core"
import * as v from "valibot"
import * as schema from "../drizzle/schema"
import { db } from "./proxy"

/* -------------------------------------------------------------------------- */
/*                             Built-in Extensions                            */
/* -------------------------------------------------------------------------- */
export function getExtClipboard(): Promise<Ext> {
	return getExtensionByIdentifierExpectExists(KUNKUN_EXT_IDENTIFIER.KUNKUN_CLIPBOARD_EXT_IDENTIFIER)
}
export function getExtQuickLinks(): Promise<Ext> {
	return getExtensionByIdentifierExpectExists(
		KUNKUN_EXT_IDENTIFIER.KUNKUN_QUICK_LINKS_EXT_IDENTIFIER
	)
}
export function getExtRemote(): Promise<Ext> {
	return getExtensionByIdentifierExpectExists(KUNKUN_EXT_IDENTIFIER.KUNKUN_REMOTE_EXT_IDENTIFIER)
}
export function getExtScriptCmd(): Promise<Ext> {
	return getExtensionByIdentifierExpectExists(
		KUNKUN_EXT_IDENTIFIER.KUNKUN_SCRIPT_CMD_EXT_IDENTIFIER
	)
}
export function getExtDev(): Promise<Ext> {
	return getExtensionByIdentifierExpectExists(KUNKUN_EXT_IDENTIFIER.KUNKUN_DEV_EXT_IDENTIFIER)
}

/* -------------------------------------------------------------------------- */
/*                               Extension CRUD                               */
/* -------------------------------------------------------------------------- */
export function createExtension(ext: {
	identifier: string
	version: string
	enabled?: boolean
	path?: string
	data?: any
}) {
	return db
		.insert(schema.extensions)
		.values({
			identifier: ext.identifier,
			version: ext.version,
			enabled: ext.enabled,
			path: ext.path,
			data: ext.data
		})
		.run()
}

export async function getUniqueExtensionByIdentifier(identifier: string): Promise<Ext | undefined> {
	const ext = await db
		.select()
		.from(schema.extensions)
		.where(orm.eq(schema.extensions.identifier, identifier))
		.get()
	const result = v.safeParse(v.optional(Ext), ext)
	if (!result.success) {
		console.error("Failed to parse extension:", v.flatten(result.issues))
		return undefined
	}
	const parsed = result.output
	return parsed
}

/**
 * Use this function when you expect the extension to exist. Such as builtin extensions.
 * @param identifier
 * @returns
 */
export function getExtensionByIdentifierExpectExists(identifier: string): Promise<Ext> {
	return getUniqueExtensionByIdentifier(identifier).then((ext) => {
		if (!ext) {
			throw new Error(`Unexpexted Error: Extension ${identifier} not found`)
		}
		return ext
	})
}

export async function getAllExtensions(): Promise<Ext[]> {
	const exts = await db.select().from(schema.extensions).all()
	return v.parse(v.array(Ext), exts)
}

/**
 * There can be duplicate extensions with the same identifier. Store and Dev extensions can have the same identifier.
 * But install path must be unique.
 * @param path
 */
export async function getUniqueExtensionByPath(path: string) {
	const ext = await db
		.select()
		.from(schema.extensions)
		.where(orm.eq(schema.extensions.path, path))
		.get()
	return v.parse(Ext, ext)
}

export function getAllExtensionsByIdentifier(identifier: string): Promise<Ext[]> {
	return db
		.select()
		.from(schema.extensions)
		.where(orm.eq(schema.extensions.identifier, identifier))
		.all()
		.then((exts) => v.parse(v.array(Ext), exts))
}

export function deleteExtensionByPath(path: string): Promise<void> {
	return db
		.delete(schema.extensions)
		.where(orm.eq(schema.extensions.path, path))
		.run()
		.then(() => undefined)
}

export function deleteExtensionByExtId(extId: number): Promise<void> {
	return db
		.delete(schema.extensions)
		.where(orm.eq(schema.extensions.extId, extId))
		.run()
		.then(() => undefined)
}

/* -------------------------------------------------------------------------- */
/*                           Extension Command CRUD                           */
/* -------------------------------------------------------------------------- */
export function createCommand(data: {
	extId: number
	name: string
	cmdType: CmdType
	data: string
	alias?: string
	hotkey?: string
	enabled?: boolean
}) {
	return db
		.insert(schema.commands)
		.values({
			extId: data.extId,
			name: data.name,
			type: data.cmdType,
			data: data.data,
			alias: data.alias,
			hotkey: data.hotkey,
			enabled: data.enabled ?? true
		})
		.run()
		.then(() => undefined)
}

export async function getCmdById(cmdId: number): Promise<ExtCmd> {
	const cmd = await db
		.select()
		.from(schema.commands)
		.where(orm.eq(schema.commands.cmdId, cmdId))
		.get()
	return v.parse(ExtCmd, cmd)
}

export async function getAllCmds(): Promise<ExtCmd[]> {
	const cmds = await db.select().from(schema.commands).all()
	return v.parse(v.array(ExtCmd), cmds)
}

export function getCommandsByExtId(extId: number) {
	return db
		.select()
		.from(schema.commands)
		.where(orm.eq(schema.commands.extId, extId))
		.all()
		.then((cmds) => v.parse(v.array(ExtCmd), cmds))
}

export function deleteCmdById(cmdId: number) {
	return db
		.delete(schema.commands)
		.where(orm.eq(schema.commands.cmdId, cmdId))
		.run()
		.then(() => undefined)
}

export function updateCmdByID(data: {
	cmdId: number
	name: string
	cmdType: CmdType
	data: string
	alias?: string
	hotkey?: string
	enabled: boolean
}) {
	return db
		.update(schema.commands)
		.set({
			name: data.name,
			type: data.cmdType,
			data: data.data,
			alias: data.alias, // optional
			hotkey: data.hotkey, // optional
			enabled: data.enabled
			// in drizzle schema, use integer({ mode: 'boolean' }) for boolean sqlite
			// enabled: data.enabled ? String(data.enabled) : undefined
		})
		.where(orm.eq(schema.commands.cmdId, data.cmdId))
		.run()
		.then(() => undefined)
}

/* -------------------------------------------------------------------------- */
/*                             Extension Data CRUD                            */
/* -------------------------------------------------------------------------- */
export const ExtDataField = v.union([v.literal("data"), v.literal("search_text")])
export type ExtDataField = v.InferOutput<typeof ExtDataField>

function convertRawExtDataToExtData(rawData?: {
	createdAt: string
	updatedAt: string
	data: null | string
	searchText?: null | string
	dataId: number
	extId: number
	dataType: string
}): ExtData | undefined {
	if (!rawData) {
		return rawData
	}
	const parsedRes = v.safeParse(ExtData, {
		...rawData,
		createdAt: new Date(rawData.createdAt),
		updatedAt: new Date(rawData.updatedAt),
		data: rawData.data ?? undefined,
		searchText: rawData.searchText ?? undefined
	})
	if (parsedRes.success) {
		return parsedRes.output
	} else {
		console.error("Extension Data Parse Failure", parsedRes.issues)
		throw new Error("Fail to parse extension data")
	}
}

export function createExtensionData(data: {
	extId: number
	dataType: string
	data: string
	searchText?: string
}) {
	return db.insert(schema.extensionData).values(data).run()
}

export function getExtensionDataById(dataId: number, fields?: ExtDataField[]) {
	const _fields = fields ?? []
	const selectQuery: SelectedFields = {
		dataId: schema.extensionData.dataId,
		extId: schema.extensionData.extId,
		dataType: schema.extensionData.dataType,
		metadata: schema.extensionData.metadata,
		createdAt: schema.extensionData.createdAt,
		updatedAt: schema.extensionData.updatedAt
		// data: schema.extensionData.data,
		// searchText: schema.extensionData.searchText
	}
	if (_fields.includes("data")) {
		selectQuery["data"] = schema.extensionData.data
	}
	if (_fields.includes("search_text")) {
		selectQuery["searchText"] = schema.extensionData.searchText
	}
	return db
		.select(selectQuery)
		.from(schema.extensionData)
		.where(orm.eq(schema.extensionData.dataId, dataId))
		.get()
		.then((rawData) => {
			console.log("Raw Data", rawData)
			// @ts-expect-error - rawData is unknown, but will be safe parsed with valibot
			return convertRawExtDataToExtData(rawData)
		})
}

export async function searchExtensionData(searchParams: {
	extId: number
	searchMode: SearchMode
	dataId?: number
	dataType?: string
	searchText?: string
	afterCreatedAt?: string
	beforeCreatedAt?: string
	limit?: number
	offset?: number
	orderByCreatedAt?: SQLSortOrder
	orderByUpdatedAt?: SQLSortOrder
	fields?: ExtDataField[]
}): Promise<ExtData[]> {
	const fields = v.parse(v.optional(v.array(ExtDataField), []), searchParams.fields)
	const _fields = fields ?? []

	// Build the select query based on fields
	const selectQuery: SelectedFields = {
		dataId: schema.extensionData.dataId,
		extId: schema.extensionData.extId,
		dataType: schema.extensionData.dataType,
		createdAt: schema.extensionData.createdAt,
		updatedAt: schema.extensionData.updatedAt
	}

	if (_fields.includes("data")) {
		selectQuery["data"] = schema.extensionData.data
	}
	if (_fields.includes("search_text")) {
		selectQuery["searchText"] = schema.extensionData.searchText
	}

	// Build the query
	let baseQuery = db.select(selectQuery).from(schema.extensionData)

	// Add FTS join if needed
	if (searchParams.searchMode === SearchModeEnum.FTS && searchParams.searchText) {
		// @ts-expect-error - The join type is correct but TypeScript can't infer it properly
		baseQuery = baseQuery.innerJoin(
			schema.extensionDataFts,
			orm.eq(schema.extensionData.dataId, schema.extensionDataFts.dataId)
		)
	}

	// Add conditions
	const conditions = [orm.eq(schema.extensionData.extId, searchParams.extId)]

	if (searchParams.dataId) {
		conditions.push(orm.eq(schema.extensionData.dataId, searchParams.dataId))
	}

	if (searchParams.dataType) {
		conditions.push(orm.eq(schema.extensionData.dataType, searchParams.dataType))
	}

	if (searchParams.searchText) {
		switch (searchParams.searchMode) {
			case SearchModeEnum.ExactMatch:
				conditions.push(orm.eq(schema.extensionData.searchText, searchParams.searchText))
				break
			case SearchModeEnum.Like:
				conditions.push(orm.like(schema.extensionData.searchText, `%${searchParams.searchText}%`))
				break
			case SearchModeEnum.FTS:
				conditions.push(
					orm.sql`${schema.extensionDataFts.searchText} MATCH ${searchParams.searchText}`
				)
				break
		}
	}

	if (searchParams.afterCreatedAt) {
		conditions.push(orm.gt(schema.extensionData.createdAt, searchParams.afterCreatedAt))
	}

	if (searchParams.beforeCreatedAt) {
		conditions.push(orm.lt(schema.extensionData.createdAt, searchParams.beforeCreatedAt))
	}

	// Build the final query with all conditions and modifiers
	const query = baseQuery
		.where(orm.and(...conditions))
		.orderBy(
			searchParams.orderByCreatedAt
				? searchParams.orderByCreatedAt === SQLSortOrderEnum.Asc
					? orm.asc(schema.extensionData.createdAt)
					: orm.desc(schema.extensionData.createdAt)
				: searchParams.orderByUpdatedAt
					? searchParams.orderByUpdatedAt === SQLSortOrderEnum.Asc
						? orm.asc(schema.extensionData.updatedAt)
						: orm.desc(schema.extensionData.updatedAt)
					: orm.asc(schema.extensionData.createdAt) // Default ordering
		)
		.limit(searchParams.limit ?? 100) // Default limit
		.offset(searchParams.offset ?? 0) // Default offset

	// Execute query and convert results
	const results = await query.all()
	return results
		.map((rawData) => {
			// @ts-expect-error - rawData is unknown, but will be safe parsed with valibot
			return convertRawExtDataToExtData(rawData)
		})
		.filter((item): item is ExtData => item !== undefined)
}

export function deleteExtensionDataById(dataId: number) {
	return db
		.delete(schema.extensionData)
		.where(orm.eq(schema.extensionData.dataId, dataId))
		.run()
		.then(() => undefined)
}

export function updateExtensionDataById(data: {
	dataId: number
	data: string
	searchText?: string
}): Promise<void> {
	return db
		.update(schema.extensionData)
		.set({
			data: data.data,
			searchText: data.searchText
		})
		.where(orm.eq(schema.extensionData.dataId, data.dataId))
		.run()
		.then(() => undefined)
}

/**
 * Database API for extensions.
 * Extensions shouldn't have full access to the database, they can only access their own data.
 * When an extension is loaded, the main thread will create an instance of this class and
 * expose it to the extension.
 */
export class JarvisExtDB implements IDb {
	extId: number

	constructor(extId: number) {
		this.extId = extId
	}

	async add(data: { data: string; dataType?: string; searchText?: string }): Promise<void> {
		return createExtensionData({
			data: data.data,
			dataType: data.dataType ?? "default",
			searchText: data.searchText,
			extId: this.extId
		}).then(() => undefined)
	}

	async delete(dataId: number): Promise<void> {
		// Verify if this data belongs to this extension
		const d = await getExtensionDataById(dataId)
		if (!d || d.extId !== this.extId) {
			throw new Error("Extension Data not found")
		}
		return await deleteExtensionDataById(dataId)
	}

	async search(searchParams: {
		dataId?: number
		searchMode?: SearchMode
		dataType?: string
		searchText?: string
		afterCreatedAt?: Date
		beforeCreatedAt?: Date
		limit?: number
		orderByCreatedAt?: SQLSortOrder
		orderByUpdatedAt?: SQLSortOrder
		fields?: ExtDataField[]
	}): Promise<ExtData[]> {
		const beforeCreatedAt = searchParams.beforeCreatedAt
			? convertDateToSqliteString(searchParams.beforeCreatedAt)
			: undefined
		const afterCreatedAt = searchParams.afterCreatedAt
			? convertDateToSqliteString(searchParams.afterCreatedAt)
			: undefined
		return searchExtensionData({
			...searchParams,
			searchMode: searchParams.searchMode ?? SearchModeEnum.FTS,
			extId: this.extId,
			beforeCreatedAt,
			afterCreatedAt
		})
	}

	/**
	 * Retrieve all data of this extension.
	 * Use `search()` method for more advanced search.
	 * @param options optional fields to retrieve. By default, data and searchText are not returned.
	 * @returns
	 */
	retrieveAll(options: { fields?: ExtDataField[] }): Promise<ExtData[]> {
		return this.search({ fields: options.fields })
	}

	/**
	 * Retrieve all data of this extension by type.
	 * Use `search()` method for more advanced search.
	 * @param dataType
	 * @returns
	 */
	retrieveAllByType(dataType: string): Promise<ExtData[]> {
		return this.search({ dataType })
	}

	/**
	 * Delete all data of this extension.
	 */
	deleteAll(): Promise<void> {
		return this.search({})
			.then((items) => {
				return Promise.all(items.map((item) => this.delete(item.dataId)))
			})
			.then(() => {})
	}

	/**
	 * Update data and searchText of this extension.
	 * @param dataId unique id of the data
	 * @param data
	 * @param searchText
	 * @returns
	 */
	async update(data: { dataId: number; data: string; searchText?: string }): Promise<void> {
		const d = await getExtensionDataById(data.dataId)
		if (!d || d.extId !== this.extId) {
			throw new Error("Extension Data not found")
		}
		return updateExtensionDataById(data)
	}
}

export class KV implements IKV {
	extId: number
	db: JarvisExtDB
	private DataType: string = "kunkun_kv"

	constructor(extId: number) {
		this.extId = extId
		this.db = new JarvisExtDB(extId)
	}

	get<T = string>(key: string): Promise<T | null | undefined> {
		return this.db
			.search({
				dataType: this.DataType,
				searchText: key,
				searchMode: SearchModeEnum.ExactMatch,
				fields: ["search_text", "data"]
			})
			.then((items) => {
				if (items.length === 0) {
					return null
				} else if (items.length > 1) {
					throw new Error("Multiple KVs with the same key")
				}
				return items[0]?.data ? (JSON.parse(items[0].data).value as T) : null
			})
			.catch((err) => {
				console.warn(err)
				return null
			})
	}

	set(key: string, value: string): Promise<void> {
		return this.db
			.search({
				dataType: this.DataType,
				searchText: key,
				searchMode: SearchModeEnum.ExactMatch
			})
			.then((items) => {
				if (items.length === 0) {
					return this.db.add({
						data: JSON.stringify({ value: value }),
						dataType: this.DataType,
						searchText: key
					})
				} else if (items.length === 1) {
					return this.db.update({
						dataId: items[0]!.dataId,
						data: JSON.stringify({ value: value }),
						searchText: key
					})
				} else {
					return Promise.all(items.map((item) => this.db.delete(item.dataId))).then(() =>
						Promise.resolve()
					)
				}
			})
	}

	delete(key: string): Promise<void> {
		return this.db
			.search({
				dataType: this.DataType,
				searchText: key,
				searchMode: SearchModeEnum.ExactMatch
			})
			.then((items) => {
				return Promise.all(items.map((item) => this.db.delete(item.dataId))).then(() =>
					Promise.resolve()
				)
			})
	}

	exists(key: string): Promise<boolean> {
		return this.db
			.search({
				dataType: this.DataType,
				searchText: key,
				searchMode: SearchModeEnum.ExactMatch,
				fields: []
			})
			.then((items) => {
				return items.length > 0
			})
	}
}
