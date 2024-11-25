import { invoke } from "@tauri-apps/api/core"
import type { FileTransferPayload } from "../models/file-transfer"
import { generateJarvisPluginCommand } from "./common"

export function getFilesToSend(): Promise<FileTransferPayload[]> {
	return invoke<FileTransferPayload[]>(generateJarvisPluginCommand("get_files_to_send"))
}

export function localNetSendFile(
	ip: string,
	port: number,
	certPem: string,
	files: string[]
): Promise<void> {
	return invoke(generateJarvisPluginCommand("local_net_send_file"), {
		filesToSend: files,
		ip,
		port,
		certPem
	})
}

export function downloadFile(
	code: string,
	filePath: string,
	sslCert: string,
	url: string
): Promise<void> {
	return invoke(generateJarvisPluginCommand("download_file"), { code, filePath, sslCert, url })
}
