import { invoke } from "@tauri-apps/api/core"
import {
	array,
	boolean,
	nullable,
	number,
	object,
	optional,
	parse,
	string,
	type InferOutput
} from "valibot"
import { generateJarvisPluginCommand } from "./common"

export const FileSearchParams = object({
	locations: array(string()),
	query: optional(string()),
	ext: optional(string()),
	depth: optional(number()),
	limit: optional(number()),
	hidden: optional(boolean(), false),
	ignore_case: optional(boolean(), false),
	file_size_greater: optional(number()),
	file_size_smaller: optional(number()),
	file_size_equal: optional(number()),
	created_after: optional(number()),
	created_before: optional(number()),
	modified_after: optional(number()),
	modified_before: optional(number())
})
export type FileSearchParams = InferOutput<typeof FileSearchParams>

export function fileSearch(
	searchParams: Omit<FileSearchParams, "hidden" | "ignore_case"> & {
		hidden?: boolean
		ignore_case?: boolean
	}
): Promise<string[]> {
	return invoke(generateJarvisPluginCommand("file_search"), {
		searchParams: parse(FileSearchParams, searchParams)
	})
}
