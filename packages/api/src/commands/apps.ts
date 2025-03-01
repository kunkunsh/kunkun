import { invoke } from "@tauri-apps/api/core"
import { AppInfo, SearchPath } from "../models"
import { generateJarvisPluginCommand } from "./common"

export function getAllApps(): Promise<AppInfo[]> {
	return invoke(generateJarvisPluginCommand("get_applications"))
}

export function refreshApplicationsList(): Promise<void> {
	return invoke(generateJarvisPluginCommand("refresh_applications_list"))
}

export function refreshApplicationsListInBg(): Promise<void> {
	return invoke(generateJarvisPluginCommand("refresh_applications_list_in_bg"))
}

export function setExtraAppSearchPaths(paths: SearchPath[]): Promise<void> {
	return invoke(generateJarvisPluginCommand("set_extra_app_search_paths"), { paths })
}

// export function convertAppToTListItem(app: AppInfo): TListItem {
//   return {
//     title: app.name,
//     value: app.app_desktop_path,
//     description: "",
//     type: "Application",
//     icon: null,
//     keywords: app.name.split(" "),
//   };
// }
