import { enum_, type InferOutput } from "valibot"

export enum SQLSortOrderEnum {
	Asc = "ASC",
	Desc = "DESC"
}

export const SQLSortOrder = enum_(SQLSortOrderEnum)
export type SQLSortOrder = InferOutput<typeof SQLSortOrder>

export enum SearchModeEnum {
	ExactMatch = "exact_match",
	Like = "like",
	FTS = "fts"
}

export const SearchMode = enum_(SearchModeEnum)
export type SearchMode = InferOutput<typeof SearchMode>

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
