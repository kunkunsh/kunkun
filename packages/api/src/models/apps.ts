import { nullable, object, string, type InferOutput } from "valibot"

export const AppInfo = object({
	name: string(),
	icon_path: nullable(string()),
	app_path_exe: nullable(string()),
	app_desktop_path: string()
})
export type AppInfo = InferOutput<typeof AppInfo>
