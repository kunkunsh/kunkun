import { invoke } from "@tauri-apps/api/core"
import { array, literal, optional, parse, safeParse, union, type InferOutput } from "valibot"
import { KUNKUN_EXT_IDENTIFIER } from "../constants"
import { CmdType, Ext, ExtCmd, ExtData } from "../models/extension"
import { convertDateToSqliteString, SearchMode, SearchModeEnum, SQLSortOrder } from "../models/sql"
import { generateJarvisPluginCommand } from "./common"

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
	return invoke<void>(generateJarvisPluginCommand("create_extension"), ext)
}

export function getAllExtensions() {
	return invoke<Ext[]>(generateJarvisPluginCommand("get_all_extensions"))
}

export function getUniqueExtensionByIdentifier(identifier: string) {
	return invoke<Ext | undefined>(
		generateJarvisPluginCommand("get_unique_extension_by_identifier"),
		{
			identifier
		}
	)
}

export function getUniqueExtensionByPath(path: string) {
	return invoke<Ext | undefined>(generateJarvisPluginCommand("get_unique_extension_by_path"), {
		path
	})
}

export function getAllExtensionsByIdentifier(identifier: string) {
	return invoke<Ext[]>(generateJarvisPluginCommand("get_all_extensions_by_identifier"), {
		identifier
	})
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

// TODO: clean this up
// export function deleteExtensionByIdentifier(identifier: string) {
// 	return invoke<void>(generateJarvisPluginCommand("delete_extension_by_identifier"), { identifier })
// }

export function deleteExtensionByPath(path: string) {
	return invoke<void>(generateJarvisPluginCommand("delete_extension_by_path"), {
		path
	})
}

export function deleteExtensionByExtId(extId: string) {
	return invoke<void>(generateJarvisPluginCommand("delete_extension_by_ext_id"), { extId })
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
	return invoke<void>(generateJarvisPluginCommand("create_command"), {
		...data,
		enabled: data.enabled ?? false
	})
}

export function getCommandById(cmdId: number) {
	return invoke<ExtCmd | undefined>(generateJarvisPluginCommand("get_command_by_id"), { cmdId })
}

export function getCommandsByExtId(extId: number) {
	return invoke<ExtCmd[]>(generateJarvisPluginCommand("get_commands_by_ext_id"), { extId })
}

export function deleteCommandById(cmdId: number) {
	return invoke<void>(generateJarvisPluginCommand("delete_command_by_id"), {
		cmdId
	})
}

export function updateCommandById(data: {
	cmdId: number
	name: string
	cmdType: CmdType
	data: string
	alias?: string
	hotkey?: string
	enabled: boolean
}) {
	return invoke<void>(generateJarvisPluginCommand("update_command_by_id"), data)
}

/* -------------------------------------------------------------------------- */
/*                             Extension Data CRUD                            */
/* -------------------------------------------------------------------------- */
export const ExtDataField = union([literal("data"), literal("search_text")])
export type ExtDataField = InferOutput<typeof ExtDataField>

function convertRawExtDataToExtData(rawData?: {
	createdAt: string
	updatedAt: string
	data: null | string
	searchText: null | string
}): ExtData | undefined {
	if (!rawData) {
		return rawData
	}
	const parsedRes = safeParse(ExtData, {
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
	return invoke<void>(generateJarvisPluginCommand("create_extension_data"), data)
}

export function getExtensionDataById(dataId: number, fields?: ExtDataField[]) {
	return invoke<
		| (ExtData & {
				createdAt: string
				updatedAt: string
				data: null | string
				searchText: null | string
		  })
		| undefined
	>(generateJarvisPluginCommand("get_extension_data_by_id"), {
		dataId,
		fields
	}).then(convertRawExtDataToExtData)
}

/**
 * Fields option can be used to select optional fields. By default, if left empty, data and searchText are not returned.
 * This is because data and searchText can be large and we don't want to return them by default.
 * If you just want to get data ids in order to delete them, retrieving all data is not necessary.
 * @param searchParams
 */
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
	const fields = parse(optional(array(ExtDataField), []), searchParams.fields)
	let items = await invoke<
		(ExtData & {
			createdAt: string
			updatedAt: string
			data: null | string
			searchText: null | string
		})[]
	>(generateJarvisPluginCommand("search_extension_data"), {
		searchQuery: {
			...searchParams,
			fields
		}
	})

	return items.map(convertRawExtDataToExtData).filter((item) => item) as ExtData[]
}

export function deleteExtensionDataById(dataId: number) {
	return invoke<void>(generateJarvisPluginCommand("delete_extension_data_by_id"), { dataId })
}

export function updateExtensionDataById(data: {
	dataId: number
	data: string
	searchText?: string
}) {
	return invoke<void>(generateJarvisPluginCommand("update_extension_data_by_id"), data)
}

/* -------------------------------------------------------------------------- */
/*                             Built-in Extensions                            */
/* -------------------------------------------------------------------------- */
export function getExtClipboard() {
	return getExtensionByIdentifierExpectExists(KUNKUN_EXT_IDENTIFIER.KUNKUN_CLIPBOARD_EXT_IDENTIFIER)
}
export function getExtQuickLinks() {
	return getExtensionByIdentifierExpectExists(
		KUNKUN_EXT_IDENTIFIER.KUNKUN_QUICK_LINKS_EXT_IDENTIFIER
	)
}
export function getExtRemote() {
	return getExtensionByIdentifierExpectExists(KUNKUN_EXT_IDENTIFIER.KUNKUN_REMOTE_EXT_IDENTIFIER)
}
export function getExtScriptCmd() {
	return getExtensionByIdentifierExpectExists(
		KUNKUN_EXT_IDENTIFIER.KUNKUN_SCRIPT_CMD_EXT_IDENTIFIER
	)
}
export function getExtDev() {
	return getExtensionByIdentifierExpectExists(KUNKUN_EXT_IDENTIFIER.KUNKUN_DEV_EXT_IDENTIFIER)
}

/**
 * Database API for extensions.
 * Extensions shouldn't have full access to the database, they can only access their own data.
 * When an extension is loaded, the main thread will create an instance of this class and
 * expose it to the extension.
 */
export class JarvisExtDB {
	extId: number

	constructor(extId: number) {
		this.extId = extId
	}

	async add(data: { data: string; dataType?: string; searchText?: string }) {
		return createExtensionData({
			data: data.data,
			dataType: data.dataType ?? "default",
			searchText: data.searchText,
			extId: this.extId
		})
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
