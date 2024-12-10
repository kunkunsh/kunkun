import { Channel, invoke } from "@tauri-apps/api/core"
import type { FilesBucket, FileTransferPayload } from "../models/file-transfer"
import { generateJarvisPluginCommand } from "./common"

export function getFileTransferBucketKeys(): Promise<string[]> {
	return invoke<string[]>(generateJarvisPluginCommand("get_file_transfer_bucket_keys"))
}

export function getFileTransferBucketByKey(key: string): Promise<FilesBucket> {
	return invoke<FilesBucket>(generateJarvisPluginCommand("get_file_transfer_bucket_by_key"), {
		key
	})
}

export function getAllFileTransferBuckets(): Promise<FilesBucket[]> {
	return getFileTransferBucketKeys().then((keys) => {
		return Promise.all(keys.map((key) => getFileTransferBucketByKey(key)))
	})
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

export function fileTransferPreviewBucket(
	files: string[]
): Promise<{ total_bytes: number; total_files: number }> {
	return invoke<{ total_bytes: number; total_files: number }>(
		generateJarvisPluginCommand("file_transfer_preview_bucket"),
		{
			files
		}
	)
}

export function downloadFile(
	code: string,
	filePath: string,
	sslCert: string,
	url: string
): Promise<void> {
	return invoke(generateJarvisPluginCommand("download_file"), { code, filePath, sslCert, url })
}

export type ProgressPayload = {
	code: string
	progressBytes: number
	totalBytes: number
	transferSpeedBytesPerSecond: number
	currentFileName: string
	totalFiles: number
	currentFileIndex: number
}

export function downloadFiles(
	payload: FileTransferPayload,
	saveDir: string,
	onProgressHandler?: (progress: ProgressPayload) => void
): Promise<void> {
	const channel = new Channel<ProgressPayload>()
	if (onProgressHandler) {
		channel.onmessage = onProgressHandler
	}
	return invoke(generateJarvisPluginCommand("download_files"), {
		payload,
		saveDir,
		onProgress: channel
	})
}
