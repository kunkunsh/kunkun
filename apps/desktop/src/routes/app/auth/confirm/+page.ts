import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ params, url }) => {
	const code = url.searchParams.get("code")
	if (!code) {
		throw error(400, "Auth Exchange Code is Required")
	}
	return { params, code }
}
