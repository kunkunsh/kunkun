import * as v from "valibot"

export type FileNode = {
	filename: string
	fileSize: number
	id: string
	type: number // 0: file, 1: directory
	children: FileNode[]
}

export const FileNode: v.GenericSchema<FileNode> = v.object({
	filename: v.string(),
	fileSize: v.number(),
	id: v.string(),
	type: v.number(), // 0: file, 1: directory
	children: v.array(v.lazy(() => FileNode))
})

export const FileTransferPayload = v.object({
	port: v.string(),
	code: v.string(),
	totalBytes: v.number(),
	totalFiles: v.number(),
	sslCert: v.string(),
	root: v.lazy(() => FileNode),
	ip: v.string()
})
export type FileTransferPayload = v.InferOutput<typeof FileTransferPayload>

export const FilesBucket = v.object({
	code: v.string(),
	idPathMap: v.record(v.string(), v.string())
})
export type FilesBucket = v.InferOutput<typeof FilesBucket>
