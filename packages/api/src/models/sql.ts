import * as v from "valibot"

export enum SQLSortOrderEnum {
	Asc = "ASC",
	Desc = "DESC"
}

export const SQLSortOrder = v.enum_(SQLSortOrderEnum)
export type SQLSortOrder = v.InferOutput<typeof SQLSortOrder>

export enum SearchModeEnum {
	ExactMatch = "exact_match",
	Like = "like",
	FTS = "fts"
}

export const SearchMode = v.enum_(SearchModeEnum)
export type SearchMode = v.InferOutput<typeof SearchMode>

export function convertDateToSqliteString(date: Date) {
	const pad = (num: number) => num.toString().padStart(2, "0")

	const year = date.getFullYear()
	const month = pad(date.getMonth() + 1) // getMonth() returns 0-11
	const day = pad(date.getDate())
	const hours = pad(date.getHours())
	const minutes = pad(date.getMinutes())
	const seconds = pad(date.getSeconds())

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const ExtDataField = v.union([v.literal("data"), v.literal("search_text")])
export type ExtDataField = v.InferOutput<typeof ExtDataField>
