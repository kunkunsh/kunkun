import { db } from "@kksh/api/commands"
import { ExtPackageJson, ExtPackageJsonExtra } from "@kksh/api/models"
import { basename, dirname, join } from "@tauri-apps/api/path"
import { readDir, readTextFile } from "@tauri-apps/plugin-fs"
import { debug, error } from "@tauri-apps/plugin-log"
import * as v from "valibot"
import { upsertExtension } from "./db"

/**
 *
 * @param manifestPath absolute path to package.json
 * @returns
 */
export function loadExtensionManifestFromDisk(manifestPath: string): Promise<ExtPackageJsonExtra> {
	debug(`loadExtensionManifestFromDisk: ${manifestPath}`)
	return readTextFile(manifestPath).then(async (content) => {
		console.log("content", content)
		const json = JSON.parse(content)
		console.log("manifest json", json)
		const parse = v.safeParse(ExtPackageJson, json)
		if (parse.issues) {
			error(`Fail to load extension from ${manifestPath}. See console for parse error.`)
			console.error("Parse Error:", v.flatten<typeof ExtPackageJson>(parse.issues))
			throw new Error(`Invalid manifest: ${manifestPath}`)
		} else {
			// debug(`Loaded extension ${parse.output.kunkun.identifier} from ${manifestPath}`)
			const extPath = await dirname(manifestPath)
			const extFolderName = await basename(extPath)
			return Object.assign(parse.output, {
				extPath,
				extFolderName
			})
		}
	})
}
export function loadAllExtensionsFromDisk(
	extensionsFolder: string
): Promise<ExtPackageJsonExtra[]> {
	return readDir(extensionsFolder).then((dirEntries) => {
		return Promise.all(
			dirEntries.map(async (dirEntry) => {
				const extFullPath = await join(extensionsFolder, dirEntry.name)
				const manifestPath = await join(extFullPath, "package.json")
				try {
					const extPkgJson = await loadExtensionManifestFromDisk(manifestPath)
					await upsertExtension(extPkgJson, extFullPath)
					return Object.assign(extPkgJson, {
						extPath: extFullPath,
						extFolderName: dirEntry.name
					})
				} catch (error) {
					return null
				}
			})
		).then((results) => results.filter((r): r is ExtPackageJsonExtra => r !== null))
	})
}

export async function loadAllExtensionsFromDb(): Promise<ExtPackageJsonExtra[]> {
	console.log("loadAllExtensionsFromDb start")
	const allDbExts = await (await db.getAllExtensions()).filter((ext) => ext.path)
	console.log("allDbExts", allDbExts)
	const results: ExtPackageJsonExtra[] = []
	for (const ext of allDbExts) {
		if (!ext.path) continue
		try {
			const extPkgJson = await loadExtensionManifestFromDisk(await join(ext.path, "package.json"))
			results.push(extPkgJson)
		} catch (err) {
			console.error(err)
			error(`Failed to load extension ${ext.path} from database.`)
			// delete this extension from database
			// await db.deleteExtensionByPath(ext.path)
		}
	}
	return results
}
