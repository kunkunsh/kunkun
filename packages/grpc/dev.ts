import fs from "fs"
import path from "path"
import tls from "tls"
import { fileURLToPath } from "url"
import grpc from "@grpc/grpc-js"
import * as kk from "./src/protos/kunkun"

// Create channel credentials with SSL verification disabled
const filepath = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filepath)

const certPath = path.join(__dirname, "../tauri-plugins/jarvis/self_signed_certs/cert.pem")
const credentials = grpc.credentials.createSsl(fs.readFileSync(certPath))

// const client = new kk.kunkun.KunkunClient("localhost:9559", credentials) // trust SSL cert

// const originalCreateSecureContext = tls.createSecureContext
// tls.createSecureContext = (options) => {
// 	if (options && options.rejectUnauthorized === false) {
// 		options.checkServerIdentity = () => undefined // Skip validation
// 	}
// 	return originalCreateSecureContext(options)
// }

const insecureSslCredentials = grpc.credentials.createSsl(
	null, // Pass `null` to skip validation
	null, // Client key (not used here)
	null // Client certificate (not used here)
)
const client = new kk.kunkun.KunkunClient("localhost:9559", insecureSslCredentials) // skip SSL cert validation
client.ServerInfo(new kk.kunkun.Empty(), (err, response) => {
	console.log(response)
	console.log("public_key", response?.public_key)
	console.log("ssl_cert", response?.ssl_cert)
	if (err) {
		console.error(err)
	}
})
// To trust any SSL cert, set NODE_TLS_REJECT_UNAUTHORIZED='0'
