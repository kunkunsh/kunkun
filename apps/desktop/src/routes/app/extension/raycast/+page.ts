import { KunkunIframeExtParams } from "@/cmds/ext"
import { i18n } from "@/i18n"
import type { Ext as ExtInfoInDB, ExtPackageJsonExtra } from "@kksh/api/models"
import { db } from "@kksh/drizzle"
import { loadExtensionManifestFromDisk } from "@kksh/extension"
import { error as svError } from "@sveltejs/kit"
import { join } from "@tauri-apps/api/path"
import { error } from "@tauri-apps/plugin-log"
import { goto } from "$app/navigation"
import { toast } from "svelte-sonner"
import * as v from "valibot"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({
	url
}): Promise<{
	extPath: string
	url: string
	loadedExt: ExtPackageJsonExtra
	extInfoInDB: ExtInfoInDB
}> => {
	// both query parameter must exist
	const rawKunkunIframeExtParams = localStorage.getItem("kunkun-iframe-ext-params")
	if (!rawKunkunIframeExtParams) {
		toast.error("Invalid extension path or url")
		return svError(404, "Invalid extension path or url")
	}
	// localStorage.removeItem("kunkun-iframe-ext-params")
	const parsed = v.safeParse(KunkunIframeExtParams, JSON.parse(rawKunkunIframeExtParams))
	if (!parsed.success) {
		toast.error("Fail to parse extension params from local storage", {
			description: `${v.flatten<typeof KunkunIframeExtParams>(parsed.issues)}`
		})
		return svError(400, "Fail to parse extension params from local storage")
	}
	const { url: extUrl, extPath } = parsed.output
	console.log("extUrl extPath", extUrl, extPath)

	const _extPath = url.searchParams.get("extPath")
	const _extUrl = url.searchParams.get("url")
	console.log("_extPath", _extPath)
	console.log("_extUrl", _extUrl)
	// if (!_extPath || !_extUrl) {
	// 	toast.error("Invalid extension path or url", {
	// 		description: `_extPath: ${_extPath}; _extUrl: ${_extUrl}`
	// 	})
	// 	error("Invalid extension path or url")
	// 	goto(i18n.resolveRoute("/app/"))
	// }
	// const extPath = z.string().parse(_extPath)
	// const extUrl = z.string().parse(_extUrl)
	let _loadedExt: ExtPackageJsonExtra | undefined
	try {
		_loadedExt = await loadExtensionManifestFromDisk(await join(extPath, "package.json"))
	} catch (err) {
		error(`Error loading extension manifest: ${err}`)
		toast.error("Error loading extension manifest", {
			description: `${err}`
		})
		goto(i18n.resolveRoute("/app/"))
	}
	const loadedExt = _loadedExt!
	const extInfoInDB = await db.getUniqueExtensionByPath(loadedExt.extPath)
	if (!extInfoInDB) {
		toast.error("Unexpected Error", {
			description: `Extension ${loadedExt.kunkun.identifier} not found in database. Run Troubleshooter.`
		})
		goto(i18n.resolveRoute("/app/"))
	}
	return { extPath, url: extUrl, loadedExt, extInfoInDB: extInfoInDB! }
}
