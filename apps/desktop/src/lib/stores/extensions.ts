import { getExtensionsFolder } from "@/constants"
import type { ExtPackageJsonExtra } from "@kksh/api/models"
import { isExtPathInDev, loadAllExtensionsFromDb } from "@kksh/extensions"
import { derived, get, writable, type Readable, type Writable } from "svelte/store"
import { appConfig } from "./appConfig"

function createExtensionsStore(): Writable<ExtPackageJsonExtra[]> & {
	init: () => Promise<void>
	getExtensionsFromStore: () => ExtPackageJsonExtra[]
} {
	const { subscribe, update, set } = writable<ExtPackageJsonExtra[]>([])

	function init() {
		return loadAllExtensionsFromDb().then((exts) => {
			set(exts)
		})
	}

	function getExtensionsFromStore() {
		const _appConfig = get(appConfig)
		if (_appConfig.extensionPath) {
			return get(extensions).filter(
				(ext) => !isExtPathInDev(_appConfig.extensionPath!, ext.extPath)
			)
		} else {
			return []
		}
	}
	return {
		init,
		getExtensionsFromStore,
		subscribe,
		update,
		set
	}
}

export const extensions = createExtensionsStore()

// export const devExtsStore: Readable<ExtPackageJsonExtra[]> = derived(extensions, ($extensionsStore, set) => {
// 	getExtensionsFolder().then(extFolder => {
// 		set($extensionsStore.filter((ext) => !ext.extPath.startsWith(extFolder)))
// 	})
// })
// export const prodExtsStore: Readable<ExtPackageJsonExtra[]> = derived(extensions, ($extensionsStore, set) => {
// 	getExtensionsFolder().then((extFolder) => {
// 		set($extensionsStore.filter((ext) => ext.extPath.startsWith(extFolder)))
// 	})
// })
