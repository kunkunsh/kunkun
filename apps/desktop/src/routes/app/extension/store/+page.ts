import { appConfig, appState, extensions, installedStoreExts } from "@/stores"
import { goHome } from "@/utils/route"
// import { supabaseAPI } from "@/supabase"
import type { ExtensionStoreListItem, ExtPackageJsonExtra } from "@kksh/api/models"
import { isExtPathInDev, isUpgradable } from "@kksh/extension"
import { getExtensionsStoreList } from "@kksh/sdk"
import { toast } from "svelte-sonner"
import { derived, get, type Readable } from "svelte/store"
import type { PageLoad } from "./$types"

export const load: PageLoad = (): Promise<{
	storeExtList: ExtensionStoreListItem[]
	installedStoreExts: Readable<ExtPackageJsonExtra[]>
	installedExtsMap: Readable<Record<string, string>>
	upgradableExpsMap: Readable<Record<string, boolean>>
}> => {
	appState.setFullScreenLoading(true)
	return getExtensionsStoreList()
		.then(({ data: storeExtList, error, response }) => {
			storeExtList = storeExtList ?? []
			if (error) {
				toast.error(`Failed to load extension store: ${error} (${response.status})`)
				goHome()
			}
			const storeExtsMap = Object.fromEntries(storeExtList.map((ext) => [ext.identifier, ext]))
			const installedExtsMap = derived(installedStoreExts, ($exts) =>
				Object.fromEntries($exts.map((ext) => [ext.kunkun.identifier, ext.version]))
			)
			const upgradableExpsMap = derived(installedStoreExts, ($exts) =>
				Object.fromEntries(
					$exts.map((ext) => {
						const dbExt: ExtensionStoreListItem | undefined = storeExtsMap[ext.kunkun.identifier]
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
		})
		.finally(() => {
			appState.setFullScreenLoading(false)
		})
}
