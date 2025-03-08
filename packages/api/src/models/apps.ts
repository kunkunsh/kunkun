import { nullable, number, object, string, type InferOutput } from "valibot"

export const AppInfo = object({
	name: string(),
	icon_path: nullable(string()),
	app_path_exe: nullable(string()),
	app_desktop_path: string()
})
export type AppInfo = InferOutput<typeof AppInfo>

export const SearchPath = object({
	path: string(),
	depth: number()
})
export type SearchPath = InferOutput<typeof SearchPath>
