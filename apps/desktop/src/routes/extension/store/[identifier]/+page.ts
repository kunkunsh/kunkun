import { supabaseAPI } from "@/supabase"
import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ params }) => {
	const { error: dbError, data } = await supabaseAPI.getLatestExtPublish(params.identifier)
	if (dbError) {
		return error(400, {
			message: dbError.message
		})
	}
	return {
		identifier: params.identifier,
		ext: data
	}
}

export const csr = true
export const prerender = false
