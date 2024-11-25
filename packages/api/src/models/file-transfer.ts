import * as v from "valibot"

export const FileTransferPayload = v.object({
	port: v.string(),
	filename: v.string(),
	code: v.string(),
	fileSize: v.number(),
	sslCert: v.string(),
	ip: v.string()
})
export type FileTransferPayload = v.InferOutput<typeof FileTransferPayload>
