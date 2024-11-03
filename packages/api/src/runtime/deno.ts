import { DenoStdio, RPCChannel } from "@hk/comlink-stdio"

// deno-lint-ignore no-explicit-any
export function expose(api: Record<string, any>) {
	const stdio = new DenoStdio(Deno.stdin.readable, Deno.stdout.writable)
	const channel = new RPCChannel(stdio, api)
	return channel
}

export { DenoStdio, RPCChannel } from "@hk/comlink-stdio"
