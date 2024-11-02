import { db, unregisterExtensionWindow } from "@kksh/api/commands"
import type { Ext as ExtInfoInDB, ExtPackageJsonExtra } from "@kksh/api/models"
import { loadExtensionManifestFromDisk } from "@kksh/extensions"
import { join } from "@tauri-apps/api/path"
import { error } from "@tauri-apps/plugin-log"
import { goto } from "$app/navigation"
import { toast } from "svelte-sonner"
import { z } from "zod"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({
	url,
	params,
	route
}): Promise<{
	extPath: string
	url: string
	loadedExt: ExtPackageJsonExtra
	extInfoInDB: ExtInfoInDB
}> => {
	// both query parameter must exist
	const _extPath = url.searchParams.get("extPath")
	const _extUrl = url.searchParams.get("url")
	if (!_extPath || !_extUrl) {
		toast.error("Invalid extension path or url")
		error("Invalid extension path or url")
		goto("/")
	}
	const extPath = z.string().parse(_extPath)
	const extUrl = z.string().parse(_extUrl)
	let _loadedExt: ExtPackageJsonExtra | undefined
	try {
		_loadedExt = await loadExtensionManifestFromDisk(await join(extPath, "package.json"))
	} catch (err) {
		error(`Error loading extension manifest: ${err}`)
		toast.error("Error loading extension manifest", {
			description: `${err}`
		})
		goto("/")
	}
	const loadedExt = _loadedExt!
	const extInfoInDB = await db.getUniqueExtensionByPath(loadedExt.extPath)
	if (!extInfoInDB) {
		toast.error("Unexpected Error", {
			description: `Extension ${loadedExt.kunkun.identifier} not found in database. Run Troubleshooter.`
		})
		goto("/")
	}
	return { extPath, url: extUrl, loadedExt, extInfoInDB: extInfoInDB! }
}
