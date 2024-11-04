import { appConfig, extensions, installedStoreExts } from "@/stores"
import { supabaseAPI } from "@/supabase"
import type { ExtPackageJsonExtra } from "@kksh/api/models"
import { SBExt } from "@kksh/api/supabase"
import { isExtPathInDev, isUpgradable } from "@kksh/extension"
import { error } from "@sveltejs/kit"
import { derived, get, type Readable } from "svelte/store"
import type { PageLoad } from "./$types"

export const load: PageLoad = async (): Promise<{
	storeExtList: SBExt[]
	installedStoreExts: Readable<ExtPackageJsonExtra[]>
	installedExtsMap: Readable<Record<string, string>>
	upgradableExpsMap: Readable<Record<string, boolean>>
}> => {
	const storeExtList = await supabaseAPI.getExtList()
	// map identifier to extItem
	const storeExtsMap = Object.fromEntries(storeExtList.map((ext) => [ext.identifier, ext]))
	const _appConfig = get(appConfig)
	// const installedStoreExts = derived(extensions, ($extensions) => {
	// 	if (!_appConfig.extensionPath) return []
	// 	return $extensions.filter((ext) => !isExtPathInDev(_appConfig.extensionPath!, ext.extPath))
	// })
	// map installed extension identifier to version
	const installedExtsMap = derived(installedStoreExts, ($exts) =>
		Object.fromEntries($exts.map((ext) => [ext.kunkun.identifier, ext.version]))
	)
	const upgradableExpsMap = derived(installedStoreExts, ($exts) =>
		Object.fromEntries(
			$exts.map((ext) => {
				const dbExt: SBExt | undefined = storeExtsMap[ext.kunkun.identifier]
				return [ext.kunkun.identifier, dbExt ? isUpgradable(dbExt, ext.version) : false]
			})
		)
	)

	return {
		storeExtList,
		installedStoreExts,
		installedExtsMap,
		upgradableExpsMap
	}
}
