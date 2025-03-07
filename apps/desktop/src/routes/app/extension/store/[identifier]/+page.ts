import { appState, extensions } from "@/stores"
import { supabaseAPI } from "@/supabase"
import { KunkunExtManifest, type ExtPackageJsonExtra } from "@kksh/api/models"
import { ExtPublishMetadata } from "@kksh/supabase/models"
import type { Tables } from "@kksh/supabase/types"
import { sleep } from "@kksh/utils"
import { error } from "@sveltejs/kit"
import { toast } from "svelte-sonner"
import * as v from "valibot"
import type { PageLoad } from "./$types"

export const load: PageLoad = ({
	params
}): Promise<{
	extPublish: Tables<"ext_publish"> & { metadata: ExtPublishMetadata }
	ext: Tables<"extensions">
	manifest: KunkunExtManifest
	params: {
		identifier: string
	}
}> => {
	appState.setFullScreenLoading(true)
	return supabaseAPI
		.getLatestExtPublish(params.identifier)
		.then(async ({ error: dbError, data: extPublish }) => {
			const metadataParse = v.safeParse(ExtPublishMetadata, extPublish?.metadata ?? {})
			if (dbError) {
				return error(400, {
					message: dbError.message
				})
			}
			const metadata = metadataParse.success ? metadataParse.output : {}
			const parseManifest = v.safeParse(KunkunExtManifest, extPublish.manifest)
			if (!parseManifest.success) {
				const errMsg = "Invalid extension manifest, you may need to upgrade your app."
				toast.error(errMsg)
				throw error(400, errMsg)
			}

			const { data: ext, error: extError } = await supabaseAPI.getExtension(params.identifier)
			if (extError) {
				return error(400, {
					message: extError.message
				})
			}

			return {
				extPublish: { ...extPublish, metadata },
				ext,
				params,
				manifest: parseManifest.output
			}
		})
		.finally(() => {
			appState.setFullScreenLoading(false)
		})
}

export const csr = true
export const prerender = false
