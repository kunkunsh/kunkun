import { extensions } from "@/stores"
import { supabaseAPI } from "@/supabase"
import { KunkunExtManifest, type ExtPackageJsonExtra } from "@kksh/api/models"
import type { Tables } from "@kksh/supabase/types"
import { error } from "@sveltejs/kit"
import { toast } from "svelte-sonner"
import { get } from "svelte/store"
import * as v from "valibot"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({
	params
}): Promise<{
	ext: Tables<"ext_publish">
	installedExt: ExtPackageJsonExtra | undefined
	manifest: KunkunExtManifest
}> => {
	const { error: dbError, data: ext } = await supabaseAPI.getLatestExtPublish(params.identifier)
	if (dbError) {
		return error(400, {
			message: dbError.message
		})
	}

	const storeExts = extensions.getExtensionsFromStore()
	const installedExt = storeExts.find((ext) => ext.kunkun.identifier === params.identifier)

	const parseManifest = v.safeParse(KunkunExtManifest, ext.manifest)
	if (!parseManifest.success) {
		const errMsg = "Invalid extension manifest, you may need to upgrade your app."
		toast.error(errMsg)
		throw error(400, errMsg)
	}

	return {
		ext,
		installedExt,
		manifest: parseManifest.output
	}
}

export const csr = true
export const prerender = false
