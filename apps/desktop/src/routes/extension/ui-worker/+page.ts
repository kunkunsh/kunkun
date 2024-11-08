import { db, unregisterExtensionWindow } from "@kksh/api/commands"
import type { Ext as ExtInfoInDB, ExtPackageJsonExtra } from "@kksh/api/models"
import { loadExtensionManifestFromDisk } from "@kksh/extension"
import { error as sbError } from "@sveltejs/kit"
import { join } from "@tauri-apps/api/path"
import { exists, readTextFile } from "@tauri-apps/plugin-fs"
import { error } from "@tauri-apps/plugin-log"
import { goto } from "$app/navigation"
import { toast } from "svelte-sonner"
import type { PageLoad } from "./$types"

// : Promise<{
// 	extPath: string
// 	scriptPath: string
// 	// workerScript: string
// 	pkgJsonPath: string
// 	cmdName: string
// 	loadedExt: ExtPackageJsonExtra
// 	extInfoInDB: ExtInfoInDB
// }>

export const load: PageLoad = async ({ url }) => {
	// both query parameter must exist
	const extPath = url.searchParams.get("extPath")
	const cmdName = url.searchParams.get("cmdName")
	if (!extPath || !cmdName) {
		toast.error("Invalid extension path or url")
		error("Invalid extension path or url")
		goto("/")
	}

	let _loadedExt: ExtPackageJsonExtra | undefined
	try {
		_loadedExt = await loadExtensionManifestFromDisk(await join(extPath!, "package.json"))
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
	const pkgJsonPath = await join(extPath!, "package.json")
	if (!(await exists(extPath!))) {
		sbError(404, `Extension not found at ${extPath}`)
	}
	if (!(await exists(pkgJsonPath))) {
		sbError(404, `Extension package.json not found at ${pkgJsonPath}`)
	}

	const cmd = loadedExt.kunkun.templateUiCmds.find((cmd) => cmd.name === cmdName)
	if (!cmd) {
		sbError(404, `Command ${cmdName} not found in extension ${loadedExt.kunkun.identifier}`)
	}
	const scriptPath = await join(loadedExt.extPath, cmd.main)
	if (!(await exists(scriptPath))) {
		sbError(404, `Command script not found at ${scriptPath}`)
	}
	// const workerScript = await readTextFile(scriptPath)
	return {
		extPath: extPath!,
		pkgJsonPath,
		scriptPath,
		// workerScript,
		cmdName: cmdName!,
		loadedExt,
		extInfoInDB: extInfoInDB!
	}
}
