import { appState, extensions } from "@/stores"
import {
	ExtensionStoreListItem,
	ExtPublish,
	KunkunExtManifest,
	type ExtPackageJsonExtra
} from "@kksh/api/models"
import {
	getExtensionsByIdentifier,
	getExtensionsLatestPublishByIdentifier,
	type GetExtensionsByIdentifierResponse,
	type GetExtensionsLatestPublishByIdentifierResponse,
	type GetExtensionsLatestPublishByIdentifierResponses
} from "@kksh/sdk"
import { error } from "@sveltejs/kit"
import { toast } from "svelte-sonner"
import * as v from "valibot"
import type { PageLoad } from "./$types"

export const load: PageLoad = ({
	params
}): Promise<{
	// extPublish: GetExtensionsLatestPublishByIdentifierResponses['200']
	ext: GetExtensionsByIdentifierResponse
	manifest: GetExtensionsLatestPublishByIdentifierResponse["manifest"]
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
				console.error(err)
				return error(400, {
					message: "Failed to get extension publish"
				})
			}
			const { data: ext, error: extError } = await getExtensionsByIdentifier({
				path: {
					identifier: params.identifier
				}
			})
			if (extError) {
				console.error(extError)
				return error(400, {
					message: "Failed to get extension"
				})
			}

			return {
				// extPublish,
				ext,
				manifest: extPublish.manifest,
				params
			}
		})
		.finally(() => {
			appState.setFullScreenLoading(false)
		})
}

export const csr = true
export const prerender = false
