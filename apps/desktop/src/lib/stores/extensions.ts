import { getExtensionsFolder } from "@/constants"
import { db } from "@kksh/api/commands"
import type { ExtPackageJson, ExtPackageJsonExtra } from "@kksh/api/models"
import * as extAPI from "@kksh/extension"
import * as path from "@tauri-apps/api/path"
import * as fs from "@tauri-apps/plugin-fs"
import { derived, get, writable, type Readable, type Writable } from "svelte/store"
import { appConfig } from "./appConfig"

function createExtensionsStore(): Writable<ExtPackageJsonExtra[]> & {
	init: () => Promise<void>
	getExtensionsFromStore: () => ExtPackageJsonExtra[]
	installTarball: (tarballPath: string, extsDir: string) => Promise<ExtPackageJsonExtra>
	installDevExtensionDir: (dirPath: string) => Promise<ExtPackageJsonExtra>
	installFromTarballUrl: (
		tarballUrl: string,
		installDir: string,
		extras?: { overwritePackageJson?: string }
	) => Promise<ExtPackageJsonExtra>
	installFromNpmPackageName: (name: string, installDir: string) => Promise<ExtPackageJsonExtra>
	findStoreExtensionByIdentifier: (identifier: string) => ExtPackageJsonExtra | undefined
	registerNewExtensionByPath: (extPath: string) => Promise<ExtPackageJsonExtra>
	uninstallStoreExtensionByIdentifier: (identifier: string) => Promise<ExtPackageJsonExtra>
	uninstallDevExtensionByIdentifier: (identifier: string) => Promise<ExtPackageJsonExtra>
	upgradeStoreExtension: (
		identifier: string,
		tarballUrl: string,
		extras?: { overwritePackageJson?: string }
	) => Promise<ExtPackageJsonExtra>
} {
	const store = writable<ExtPackageJsonExtra[]>([])

	/**
	 * Load all extensions from the database and disk, all extensions manifest will be stored in the store
	 * @returns loaded extensions
	 */
	function init() {
		return extAPI.loadAllExtensionsFromDb().then((exts) => {
			store.set(exts)
		})
	}

	/**
	 * Get all extensions installed from the store (non-dev extensions)
	 */
	function getExtensionsFromStore(): ExtPackageJsonExtra[] {
		const extContainerPath = get(appConfig).extensionsInstallDir
		if (!extContainerPath) return []
		return get(extensions).filter((ext) => !extAPI.isExtPathInDev(extContainerPath, ext.extPath))
	}

	/**
	 * Get all dev extensions
	 */
	function getDevExtensions(): ExtPackageJsonExtra[] {
		const extContainerPath = get(appConfig).extensionsInstallDir
		if (!extContainerPath) return []
		return get(extensions).filter((ext) => extAPI.isExtPathInDev(extContainerPath, ext.extPath))
	}

	/**
	 * Find an extension by its identifier
	 * @param identifier extension identifier
	 * @returns found extension or undefined
	 */
	function findStoreExtensionByIdentifier(identifier: string): ExtPackageJsonExtra | undefined {
		return get(extensions).find((ext) => ext.kunkun.identifier === identifier)
	}

	/**
	 * After install, register the extension to the store
	 * @param extPath absolute path to the extension folder
	 * @returns loaded extension
	 */
	async function registerNewExtensionByPath(extPath: string): Promise<ExtPackageJsonExtra> {
		return extAPI
			.loadExtensionManifestFromDisk(await path.join(extPath, "package.json"))
			.then((ext) => {
				store.update((exts) => {
					const existingExt = exts.find((e) => e.extPath === ext.extPath)
					if (existingExt) return exts
					return [...exts, ext]
				})
				return ext
			})
			.catch((err) => {
				console.error(err)
				return Promise.reject(err)
			})
	}

	/**
	 * Install extension from tarball file
	 * @param tarballPath absolute path to the tarball file
	 * @param extsDir absolute path to the extensions directory
	 * @returns loaded extension
	 */
	async function installTarball(
		tarballPath: string,
		extsDir: string
	): Promise<ExtPackageJsonExtra> {
		return extAPI.installTarballUrl(tarballPath, extsDir).then((extInstallPath) => {
			return registerNewExtensionByPath(extInstallPath)
		})
	}

	async function installDevExtensionDir(dirPath: string): Promise<ExtPackageJsonExtra> {
		return extAPI
			.installDevExtensionDir(dirPath)
			.then((ext) => {
				return registerNewExtensionByPath(ext.extPath)
			})
			.catch((err) => {
				console.error(err)
				return Promise.reject(err)
			})
	}

	async function installFromTarballUrl(
		tarballUrl: string,
		extsDir: string,
		extras?: { overwritePackageJson?: string }
	) {
		return extAPI.installTarballUrl(tarballUrl, extsDir, extras).then((extInstallPath) => {
			return registerNewExtensionByPath(extInstallPath)
		})
	}

	async function installFromNpmPackageName(name: string, extsDir: string) {
		return extAPI.installFromNpmPackageName(name, extsDir).then((extInstallPath) => {
			return registerNewExtensionByPath(extInstallPath)
		})
	}

	/**
	 * Uninstall an extension by its path
	 * @param targetPath absolute path to the extension folder
	 * @returns uninstalled extension
	 */
	async function uninstallExtensionByPath(targetPath: string): Promise<ExtPackageJsonExtra> {
		const targetExt = get(extensions).find((ext) => ext.extPath === targetPath)
		if (!targetExt) throw new Error(`Extension ${targetPath} not registered in DB`)
		return extAPI
			.uninstallExtensionByPath(targetPath)
			.then(() => store.update((exts) => exts.filter((ext) => ext.extPath !== targetExt.extPath)))
			.then(() => targetExt)
	}

	/**
	 * Uninstall a dev extension by its path
	 * Files will not be removed from disk, only unregistered from the DB
	 * @param targetPath absolute path to the extension folder
	 * @returns uninstalled extension
	 */
	async function uninstallDevExtensionByPath(targetPath: string): Promise<ExtPackageJsonExtra> {
		const targetExt = get(extensions).find((ext) => ext.extPath === targetPath)
		if (!targetExt) throw new Error(`Extension ${targetPath} not registered in DB`)
		// remove from DB
		return db
			.deleteExtensionByPath(targetPath)
			.then(() => store.update((exts) => exts.filter((ext) => ext.extPath !== targetExt.extPath)))
			.then(() => targetExt)
	}

	async function uninstallDevExtensionByIdentifier(
		identifier: string
	): Promise<ExtPackageJsonExtra> {
		const targetExt = getDevExtensions().find((ext) => ext.kunkun.identifier === identifier)
		if (!targetExt) throw new Error(`Extension ${identifier} not found`)
		return uninstallDevExtensionByPath(targetExt.extPath)
	}

	async function uninstallStoreExtensionByIdentifier(
		identifier: string
	): Promise<ExtPackageJsonExtra> {
		const targetExt = getExtensionsFromStore().find((ext) => ext.kunkun.identifier === identifier)
		if (!targetExt) throw new Error(`Extension ${identifier} not found`)
		return uninstallExtensionByPath(targetExt.extPath)
	}

	async function upgradeStoreExtension(
		identifier: string,
		tarballUrl: string,
		extras?: { overwritePackageJson?: string }
	): Promise<ExtPackageJsonExtra> {
		const extsDir = get(appConfig).extensionsInstallDir
		if (!extsDir) throw new Error("Extension path not set")
		return uninstallStoreExtensionByIdentifier(identifier).then(() =>
			installFromTarballUrl(tarballUrl, extsDir, extras)
		)
	}

	return {
		...store,
		init,
		getExtensionsFromStore,
		findStoreExtensionByIdentifier,
		registerNewExtensionByPath,
		installTarball,
		installDevExtensionDir,
		installFromTarballUrl,
		installFromNpmPackageName,
		uninstallStoreExtensionByIdentifier,
		uninstallDevExtensionByIdentifier,
		upgradeStoreExtension
	}
}

export const extensions = createExtensionsStore()

export const installedStoreExts: Readable<ExtPackageJsonExtra[]> = derived(
	extensions,
	($extensionsStore) => {
		const extContainerPath = get(appConfig).extensionsInstallDir
		if (!extContainerPath) return []
		return $extensionsStore.filter((ext) => !extAPI.isExtPathInDev(extContainerPath, ext.extPath))
	}
)
export const devStoreExts: Readable<ExtPackageJsonExtra[]> = derived(
	extensions,
	($extensionsStore) => {
		const extContainerPath = get(appConfig).extensionsInstallDir
		if (!extContainerPath) return []
		return $extensionsStore.filter((ext) => extAPI.isExtPathInDev(extContainerPath, ext.extPath))
	}
)
