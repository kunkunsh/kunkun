import * as relations from "@kksh/drizzle/relations"
import * as schema from "../drizzle/schema"
import {
    CmdType,
    Ext,
    ExtCmd,
    ExtData,
    SearchMode,
    SearchModeEnum,
    SQLSortOrder,
    SQLSortOrderEnum
} from "@kksh/api/models"
import * as orm from "drizzle-orm"
import type { SelectedFields } from "drizzle-orm/sqlite-core"
import * as v from "valibot"
import { db } from "./proxy"

/* -------------------------------------------------------------------------- */
/*                             Built-in Extensions                            */
/* -------------------------------------------------------------------------- */
export function getExtClipboard() {
    // return getExtensionByIdentifierExpectExists(KUNKUN_EXT_IDENTIFIER.KUNKUN_CLIPBOARD_EXT_IDENTIFIER)
}
export function getExtQuickLinks() {
    // return getExtensionByIdentifierExpectExists(
    // 	KUNKUN_EXT_IDENTIFIER.KUNKUN_QUICK_LINKS_EXT_IDENTIFIER
    // )
}
export function getExtRemote() {
    // return getExtensionByIdentifierExpectExists(KUNKUN_EXT_IDENTIFIER.KUNKUN_REMOTE_EXT_IDENTIFIER)
}
export function getExtScriptCmd() {
    // return getExtensionByIdentifierExpectExists(
    // 	KUNKUN_EXT_IDENTIFIER.KUNKUN_SCRIPT_CMD_EXT_IDENTIFIER
    // )
}
export function getExtDev() {
    // return getExtensionByIdentifierExpectExists(KUNKUN_EXT_IDENTIFIER.KUNKUN_DEV_EXT_IDENTIFIER)
}

/* -------------------------------------------------------------------------- */
/*                               Extension CRUD                               */
/* -------------------------------------------------------------------------- */
export async function getUniqueExtensionByIdentifier(identifier: string): Promise<Ext | undefined> {
    const ext = await db
        .select()
        .from(schema.extensions)
        .where(orm.eq(schema.extensions.identifier, identifier))
        .get()
    return v.parse(v.optional(Ext), ext)
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

// export async function getExtensionWithCmdsByIdentifier(identifier: string): Promise<ExtWithCmds> {
// 	const ext = await db
// 		.select({
// 			...schema.extensions,
// 			commands: relations.commandsRelations
// 		})
// 		.from(schema.extensions)
// 		.leftJoin(schema.commands, orm.eq(schema.extensions.extId, schema.commands.extId))
// 		.where(orm.eq(schema.extensions.identifier, identifier))
// 		.get()

// 	// return v.parse(v.nullable(ExtWithCmds), ext);
// }

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
	
    // return invoke<void>(generateJarvisPluginCommand("delete_extension_data_by_id"), { dataId })
}

export function updateExtensionDataById(data: {
	dataId: number
	data: string
	searchText?: string
}) {
	// return invoke<void>(generateJarvisPluginCommand("update_extension_data_by_id"), data)
}


// export async function getNCommands(n: number):
// export function createExtension(ext: {
// 	identifier: string
// 	version: string
// 	enabled?: boolean
// 	path?: string
// 	data?: any
// }) {
// 	return invoke<void>(generateJarvisPluginCommand("create_extension"), ext)
// }
