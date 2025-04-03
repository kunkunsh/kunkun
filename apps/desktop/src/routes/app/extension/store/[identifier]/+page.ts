import { appState } from "@/stores"
import { DBExtension, ExtPublish, KunkunExtManifest } from "@kksh/api/models"
import { getExtensionsByIdentifier, getExtensionsLatestPublishByIdentifier } from "@kksh/sdk"
import { error } from "@sveltejs/kit"
import * as v from "valibot"
import type { PageLoad } from "./$types"

export const load: PageLoad = ({
	params
}): Promise<{
	extPublish: ExtPublish
	ext: DBExtension
	manifest: KunkunExtManifest
	params: {
		identifier: string
	}
}> => {
	appState.setFullScreenLoading(true)
	return getExtensionsLatestPublishByIdentifier({
		path: {
			identifier: params.identifier
		}
	})
		.then(async ({ data: extPublish, error: err, response }) => {
			if (err || !extPublish) {
				return error(response.status, {
					message: "Failed to get extension publish"
				})
			}
			const {
				data: ext,
				error: extError,
				response: extRes
			} = await getExtensionsByIdentifier({
				path: {
					identifier: params.identifier
				}
			})
			if (extError || !ext) {
				console.error(extError)
				return error(extRes.status, {
					message: extError.error || "Failed to get extension"
				})
			}
			return {
				extPublish: v.parse(ExtPublish, extPublish),
				ext,
				manifest: v.parse(KunkunExtManifest, extPublish.manifest),
				params
			}
		})
		.finally(() => {
			appState.setFullScreenLoading(false)
		})
}

export const csr = true
export const prerender = false
