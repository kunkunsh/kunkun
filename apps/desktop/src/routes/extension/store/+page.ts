import { appConfig, extensions } from "@/stores"
import { supabaseAPI } from "@/supabase"
import type { ExtPackageJsonExtra } from "@kksh/api/models"
import { isExtPathInDev } from "@kksh/extension"
import { ExtItem, type Tables } from "@kksh/supabase"
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
	const storeExtList = await supabaseAPI.getExtList()
	const _appConfig = get(appConfig)
	const installedStoreExts = derived(extensions, ($extensions) => {
		if (!_appConfig.extensionPath) return []
		return $extensions.filter((ext) => !isExtPathInDev(_appConfig.extensionPath!, ext.extPath))
	})
	const installedExtsMap = derived(installedStoreExts, ($exts) =>
		Object.fromEntries($exts.map((ext) => [ext.kunkun.identifier, ext.version]))
	)

	return { storeExtList, installedStoreExts, installedExtsMap }
}
