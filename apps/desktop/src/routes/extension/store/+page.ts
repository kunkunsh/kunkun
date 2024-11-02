import { appConfig, extensions } from "@/stores"
import { ExtItem, getExtList } from "@/supabase"
import type { ExtPackageJsonExtra } from "@kksh/api/models"
import { isExtPathInDev } from "@kksh/extensions"
import { type Tables } from "@kksh/supabase"
import { error } from "@sveltejs/kit"
import { derived, get, type Readable } from "svelte/store"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({
	params
}): Promise<{
	storeExtList: ExtItem[]
	installedStoreExts: Readable<ExtPackageJsonExtra[]>
	installedExtsMap: Readable<Record<string, string>>
}> => {
	const storeExtList = await getExtList()
	// const installedExts = extensions.getExtensionsFromStore()
	const _appConfig = get(appConfig)
	if (!_appConfig.extensionPath) {
		return error(404, "Extension path not found")
	}
	const installedStoreExts = derived(extensions, ($extensions) => {
		return $extensions.filter((ext) => !isExtPathInDev(_appConfig.extensionPath!, ext.extPath))
	})
	const installedExtsMap = derived(installedStoreExts, ($exts) => {
		return Object.fromEntries($exts.map((ext) => [ext.kunkun.identifier, ext.version]))
	})

	return { storeExtList, installedStoreExts, installedExtsMap }
}
