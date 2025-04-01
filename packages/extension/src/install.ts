/**
 * This file contains helper functions for operations related to installing extensions
 * including install, uninstall, upgrade, check app-extension compatibility, etc.
 */
import { isCompatible } from "@kksh/api"
import { copy_dir_all, decompressTarball } from "@kksh/api/commands"
import type { ExtensionStoreListItem, ExtPackageJsonExtra } from "@kksh/api/models"
import { db } from "@kksh/drizzle"
import { greaterThan, parse as parseSemver } from "@std/semver"
import * as path from "@tauri-apps/api/path"
import * as dialog from "@tauri-apps/plugin-dialog"
import * as fs from "@tauri-apps/plugin-fs"
import { download } from "@tauri-apps/plugin-upload"
import { v4 as uuidv4 } from "uuid"
import { z, ZodError } from "zod"
import { loadExtensionManifestFromDisk } from "./load"
import { isExtPathInDev } from "./utils"

/**
 *
 * @param tarballPath path to .tar.gz file
 */
export async function installTarball(
	tarballPath: string,
	extsDir: string,
	extras?: {
		overwritePackageJson?: string
	}
): Promise<string> {
	const tempDirPath = await path.tempDir()
	if (!extsDir) {
		return Promise.reject("Extension Folder Not Set")
	}
	// decompress tarball to tempDir
	const decompressDest = await decompressTarball(
		tarballPath,
		await path.join(tempDirPath, uuidv4()),
		{
			overwrite: true
		}
	)
	const pkgJsonPath = await path.join(decompressDest, "package.json")
	if (extras?.overwritePackageJson) {
		await fs.writeTextFile(pkgJsonPath, extras.overwritePackageJson)
	}
	return loadExtensionManifestFromDisk(pkgJsonPath)
		.then(async (manifest) => {
			// The extension folder name will be the identifier
			const extInstallPath = await path.join(extsDir, manifest.kunkun.identifier)
			if (await fs.exists(extInstallPath)) {
				const overwrite = await dialog.ask(
					`Extension ${manifest.kunkun.identifier} already exists, do you want to overwrite it?`
				)
				if (!overwrite) {
					return Promise.reject("Extension Already Exists")
				}
				await fs.remove(extInstallPath, { recursive: true })
			}

			// find extension in db, if exists, ask user if they want to overwrite it
			const exts = await db.getAllExtensionsByIdentifier(manifest.kunkun.identifier)
			const storeExts = exts.filter((ext) => ext.path && !isExtPathInDev(extsDir, ext.path))
			if (storeExts.length > 0) {
				const overwrite = await dialog.ask(
					`Extension ${manifest.kunkun.identifier} already exists in database (but not on disk), do you want to overwrite it?`
				)
				if (!overwrite) {
					return Promise.reject("Extension Already Exists")
				}
				if (exts[0].path) {
					console.log(
						"delete extension in db (overwrite in order to install a new version)",
						exts[0].path
					)
					await db.deleteExtensionByPath(exts[0].path)
				}
			}

			// copy all files from decompressDest to extInstallPat
			await copy_dir_all(decompressDest, extInstallPath)

			// Clean up temp directory
			// we need the actual temp dir, as decompressDest is the /tmp/uuidv4/package dir
			const tempDir = await path.dirname(decompressDest)
			// tempDir is "/tmp/uuidv4"
			await fs.remove(tempDir, { recursive: true })

			await db.createExtension({
				identifier: manifest.kunkun.identifier,
				version: manifest.version,
				enabled: true,
				path: extInstallPath,
				data: undefined
			})

			console.log("installTarball in DB success", manifest)
			return extInstallPath
		})
		.catch((err) => {
			if (err instanceof ZodError) {
				console.error(err)
				throw new Error("Invalid Manifest or Extension")
			}
			console.error("installTarball error", err)
			throw new Error(err)
		})
}

/**
 * Install extension tarball from a URL
 * @param tarballUrl URL to the tarball
 * @param extsDir Target directory to install the tarball
 * @returns
 */
export async function installTarballUrl(
	tarballUrl: string,
	extsDir: string,
	extras?: { overwritePackageJson?: string }
): Promise<string> {
	const filename = await path.basename(tarballUrl)
	if (filename) {
		const tempDirPath = await path.tempDir()
		let tarballPath = await path.join(tempDirPath, filename)
		console.log("tarballPath", tarballPath)
		await download(tarballUrl, tarballPath)
		const extInstallPath = await installTarball(tarballPath, extsDir, extras)
		await fs.remove(tarballPath)
		return extInstallPath
	} else {
		return Promise.reject("Invalid Tarball URL. Cannot parse filename")
	}
}

/**
 * Install dev extension from a local directory
 * @param extPath Path to the extension directory
 * @returns
 */
export async function installDevExtensionDir(extPath: string): Promise<ExtPackageJsonExtra> {
	const manifestPath = await path.join(extPath, "package.json")
	if (!(await fs.exists(manifestPath))) {
		return Promise.reject(
			`Invalid Extension Folder. Manifest package.json doesn't exist at ${manifestPath}`
		)
	}
	return loadExtensionManifestFromDisk(manifestPath)
		.then(async (manifest) => {
			const exts = await db.getAllExtensionsByIdentifier(manifest.kunkun.identifier)
			const extExists = exts.find((ext) => ext.path === extPath)
			if (extExists) {
				return Promise.reject(`Extension Already Exists at ${extExists.path}. It will be skipped.`)
			}
			// manifest.extPath
			return db
				.createExtension({
					identifier: manifest.kunkun.identifier,
					version: manifest.version,
					enabled: true,
					path: extPath,
					data: undefined
				})
				.then(() => {
					return manifest
				})
				.catch((err) => {
					return Promise.reject(err)
				})
		})
		.catch((err) => {
			return Promise.reject(err)
		})
}

export async function installThroughNpmAPI(url: string, extsDir: string) {
	return fetch(url)
		.then((res) => res.json())
		.then((json) => {
			const tarball = z.string().safeParse(json?.dist?.tarball)
			if (tarball.success) {
				return installTarballUrl(tarball.data, extsDir)
			} else {
				return Promise.reject("Tarball Not Found")
			}
		})
}

export async function installFromNpmPackageName(name: string, extsDir: string) {
	return installThroughNpmAPI(`https://registry.npmjs.org/${name}/latest`, extsDir)
}

export async function uninstallExtensionByPath(extPath: string) {
	if (!(await fs.exists(extPath))) throw new Error(`Extension ${extPath} not found`)
	return fs.remove(extPath, { recursive: true }).then(() => db.deleteExtensionByPath(extPath))
}

export function isUpgradable(dbExt: ExtensionStoreListItem, installedExtVersion: string) {
	const upgradable =
		greaterThan(parseSemver(dbExt.version), parseSemver(installedExtVersion)) && dbExt.api_version
			? isCompatible(dbExt.api_version)
			: false

	return upgradable
}
