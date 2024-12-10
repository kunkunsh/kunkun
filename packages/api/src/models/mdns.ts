import { array, number, object, optional, record, string, type InferOutput } from "valibot"

export const MdnsServiceInfo = object({
	addresses: array(string()),
	fullname: string(),
	hostname: string(),
	port: number(),
	service_type: string(),
	subType: optional(string()),
	properties: optional(record(string(), string())),
	publicKey: string(),
	sslCert: string()
})

export type MdnsServiceInfo = InferOutput<typeof MdnsServiceInfo>

export const MdnsPeers = record(string(), MdnsServiceInfo)

export type MdnsPeers = InferOutput<typeof MdnsPeers>
