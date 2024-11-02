import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load: PageLoad = ({ params }) => {
	return {
		identifier: params.identifier
	}
}

export const csr = true
export const prerender = false
