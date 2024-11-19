import { DenoIo, RPCChannel } from "kkrpc"

// deno-lint-ignore no-explicit-any
export function expose(api: Record<string, any>) {
	const stdio = new DenoIo(Deno.stdin.readable, Deno.stdout.writable)
	const channel = new RPCChannel(stdio, { expose: api })
	return channel
}

export { DenoIo, RPCChannel } from "kkrpc"
