import { extensions } from "@/stores"
import { supabaseAPI } from "@/supabase"
import { KunkunExtManifest, type ExtPackageJsonExtra } from "@kksh/api/models"
import { ExtPublishMetadata } from "@kksh/supabase/models"
import type { Tables } from "@kksh/supabase/types"
import { error } from "@sveltejs/kit"
import { toast } from "svelte-sonner"
import * as v from "valibot"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({
	params
}): Promise<{
	ext: Tables<"ext_publish"> & { metadata: ExtPublishMetadata }
	manifest: KunkunExtManifest
	params: {
		identifier: string
	}
}> => {
	const { error: dbError, data: ext } = await supabaseAPI.getLatestExtPublish(params.identifier)
	const metadataParse = v.safeParse(ExtPublishMetadata, ext?.metadata ?? {})
	if (dbError) {
		return error(400, {
			message: dbError.message
		})
	}
	const metadata = metadataParse.success ? metadataParse.output : {}
	const parseManifest = v.safeParse(KunkunExtManifest, ext.manifest)
	if (!parseManifest.success) {
		const errMsg = "Invalid extension manifest, you may need to upgrade your app."
		toast.error(errMsg)
		throw error(400, errMsg)
	}

	return {
		ext: { ...ext, metadata },
		params,
		manifest: parseManifest.output
	}
}

export const csr = true
export const prerender = false
