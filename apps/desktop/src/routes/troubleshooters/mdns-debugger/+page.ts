import { getPeers } from "@kksh/api/commands"
import type { MdnsPeers } from "@kksh/api/models"

export const load = async () => {
	const peers = await getPeers()
	return { peers }
}
