import type { MdnsPeers } from "@kksh/api/models"
import { invoke } from "@tauri-apps/api/core"
import { generateJarvisPluginCommand } from "./common"

export function getPeers(): Promise<MdnsPeers> {
	return invoke<MdnsPeers>(generateJarvisPluginCommand("get_peers"))
}
