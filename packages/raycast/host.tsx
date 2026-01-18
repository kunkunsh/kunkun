import module from "module"
import { TransformStream } from "stream/web"
import { IoInterface, NodeIo, RPCChannel, WebSocketServerIO } from "kkrpc"
import react from "react"
import reactRuntime from "react/jsx-runtime"
import { WebSocketServer } from "ws"
import * as raycast from "./api"
import reconciler from "./reconciler"

module.prototype.require = new Proxy(module.prototype.require, {
	apply(target, thisArg, argumentsList) {
		const replacements = {
			react,
			"react/jsx-runtime": reactRuntime,
			"@raycast/api": raycast
		}

		const replacement = replacements[argumentsList[0]]
		if (replacement) {
			return replacement
		}

		return Reflect.apply(target, thisArg, argumentsList)
	}
})

const { readable, writable } = new TransformStream()
const reader = readable.getReader()
const writer = writable.getWriter()
process.stdin.on("data", (data) => writer.write(data))

const RPC_METHOD = "stdio"

if (RPC_METHOD === "stdio") {
	// const stdio = new NodeIo(process.stdin, process.stdout)
	const stdio: IoInterface = {
		name: "stdio",
		async read() {
			const { value } = await reader.read()
			return value
		},
		write(data) {
			return new Promise((resolve) => process.stdout.write(data, () => resolve()))
		}
	}
	init(stdio)
} else {
	const wss = new WebSocketServer({ port: 5000 })
	console.log("WebSocket server started on ws://localhost:5000")
	wss.on("connection", (ws) => {
		const stdio = new WebSocketServerIO(ws)
		init(stdio)
	})
}

function init(stdio) {
	const child = new RPCChannel(stdio)

	const originalCallMethod = child.callMethod
	child.callMethod = function (method, args) {
		console.log("callMethod", method, JSON.stringify(args))
		return originalCallMethod.call(this, method, args)
	}

	const api = child.getAPI()
	;(async () => {
		const app = await import(`${process.cwd()}/dist/index.js`)
		reconciler.render(<app.default.default></app.default.default>, api)
	})()
}
