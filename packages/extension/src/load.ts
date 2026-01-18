import {
	CmdTypeEnum,
	ExtPackageJson,
	ExtPackageJsonExtra,
	IconEnum,
	KunkunExtManifest,
	License
} from "@kksh/api/models"
import { db } from "@kksh/drizzle"
import { basename, dirname, join } from "@tauri-apps/api/path"
import { readDir, readFile, readTextFile } from "@tauri-apps/plugin-fs"
import { debug, error } from "@tauri-apps/plugin-log"
import semver from "semver"
import * as v from "valibot"
import { upsertExtension } from "./db"

const OptionalExtPackageJson = v.object({
	...ExtPackageJson.entries,
	license: v.optional(License, "MIT") // TODO: remove this optional package json later
})

const RaycastExtPackageJson = v.object({
	...v.omit(OptionalExtPackageJson, ["kunkun"]).entries,
	title: v.string(),
	description: v.string(),
	icon: v.string(),
	version: v.optional(v.string(), "Version of the extension"),
	commands: v.array(
		v.object({
			name: v.string(),
			title: v.string(),
			subtitle: v.optional(v.string()),
			description: v.string(),
			mode: v.picklist(["view", "no-view"])
		})
	)
})

// https://stackoverflow.com/a/66046176
async function bufferToBase64(buffer) {
	// use a FileReader to generate a base64 data URI:
	const base64url = await new Promise((r) => {
		const reader = new FileReader()
		reader.onload = () => r(reader.result)
		reader.readAsDataURL(new Blob([buffer]))
	})
	// remove the `data:...;base64,` part from the start
	return base64url.slice(base64url.indexOf(",") + 1)
}

export function parseAPIVersion(dependencies: Record<string, string>) {
	const stripPrefix = (version: string) => version.replace(/^[^0-9]+/, "") // Remove leading ^, ~, etc.
	const apiVersion = dependencies["@kksh/api"]
	if (apiVersion) {
		return semver.clean(stripPrefix(apiVersion)) ?? undefined
	}
	return undefined
}

/**
 *
 * @param manifestPath absolute path to package.json
 * @returns
 */
export function loadExtensionManifestFromDisk(manifestPath: string): Promise<ExtPackageJsonExtra> {
	debug(`loadExtensionManifestFromDisk: ${manifestPath}`)
	return readTextFile(manifestPath).then(async (content) => {
		const json = JSON.parse(content)

		const raycastParse = v.safeParse(RaycastExtPackageJson, json)
		if (!raycastParse.issues) {
			const raycast = raycastParse.output
			json.kunkun = {
				name: raycast.title,
				shortDescription: raycast.description,
				longDescription: "",
				identifier: raycast.name,
				permissions: ["shell:deno:execute", "shell:deno:spawn", "shell:all", "shell:execute"],
				demoImages: [],
				icon: {
					// TODO: is this the best way to do this?
					type: IconEnum.Base64PNG,
					value: await bufferToBase64(
						await readFile(await join(await dirname(manifestPath), "assets", raycast.icon))
					)
				},
				customUiCmds: raycast.commands.map((cmd) => ({
					main: "/",
					dist: "dist",
					name: cmd.title,
					cmds: [],
					type: CmdTypeEnum.Raycast,
					description: cmd.description,
					platforms: [],
					devMain: ""
				}))
			} satisfies KunkunExtManifest
			delete json.commands

			json.version = "1.0.0"
		}

		const parse = v.safeParse(OptionalExtPackageJson, json)
		if (parse.issues) {
			error(`Fail to load extension from ${manifestPath}. See console for parse error.`)
			console.error("Parse Error:", v.flatten<typeof OptionalExtPackageJson>(parse.issues))
			throw new Error(`Invalid manifest: ${manifestPath}`)
		} else {
			const apiVersion = parseAPIVersion(parse.output.dependencies || {})
			const extPath = await dirname(manifestPath)
			const extFolderName = await basename(extPath)
			return Object.assign(parse.output, {
				extPath,
				extFolderName,
				apiVersion
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

/**
 * Load all extensions from the database
 * Then load the manifest from the disk
 * If a extension is in database but cannot be loaded from disk, it will be skipped
 * @returns loaded extensions
 */
export async function loadAllExtensionsFromDb(): Promise<ExtPackageJsonExtra[]> {
	const allDbExts = (await db.getAllExtensions()).filter((ext) => ext.path)
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
