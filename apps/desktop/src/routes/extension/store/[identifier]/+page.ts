import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load: PageLoad = ({ params }) => {
	return {
		identifier: params.identifier
	}
	error(404, "Not found")
}
