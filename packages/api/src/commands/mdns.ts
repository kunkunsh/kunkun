import { invoke } from "@tauri-apps/api/core"
import type { MdnsPeers } from "../models/mdns"
import { generateJarvisPluginCommand } from "./common"

export function getPeers(): Promise<MdnsPeers> {
	return invoke<MdnsPeers>(generateJarvisPluginCommand("get_peers"))
}
