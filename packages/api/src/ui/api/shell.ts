import { RPCChannel, type IoInterface } from "kkrpc/browser"
import {
	// Child,
	EventEmitter,
	hasCommand,
	likelyOnWindows,
	open as shellxOpen,
	// EventEmitter,
	// Command as ShellxCommand,
	type ChildProcess,
	type CommandEvent,
	type CommandEvents,
	type InternalSpawnOptions,
	type IOPayload,
	type OutputEvents,
	type SpawnOptions
} from "tauri-plugin-shellx-api"
import { type DenoRunConfig } from "../client.ts"
import type { IShellServer } from "../server/server-types.ts"

export class Child {
	/** The child process `pid`. */
	pid: number
	api: IShellServer
	constructor(pid: number, api: IShellServer) {
		this.pid = pid
		this.api = api
	}

	/**
	 * Writes `data` to the `stdin`.
	 *
	 * @param data The message to write, either a string or a byte array.
	 * @example
	 * ```typescript
	 * import { Command } from '@tauri-apps/plugin-shell';
	 * const command = Command.create('node');
	 * const child = await command.spawn();
	 * await child.write('message');
	 * await child.write([0, 1, 2, 3, 4, 5]);
	 * ```
	 *
	 * @returns A promise indicating the success or failure of the operation.
	 *
	 * @since 2.0.0
	 */
	async write(data: IOPayload | number[]): Promise<void> {
		// await invoke('plugin:shellx|stdin_write', {
		//   pid: this.pid,
		//   buffer: data
		// })
		this.api.stdinWrite(data.toString(), this.pid)
	}

	/**
	 * Kills the child process.
	 *
	 * @returns A promise indicating the success or failure of the operation.
	 *
	 * @since 2.0.0
	 */
	async kill(): Promise<void> {
		this.api.kill(this.pid)
		// await invoke("plugin:shellx|kill", {
		// 	cmd: "killChild",
		// 	pid: this.pid
		// })
	}
}

class BaseShellCommand<O extends IOPayload> extends EventEmitter<CommandEvents> {
	/** @ignore Program to execute. */
	readonly program: string
	/** @ignore Program arguments */
	readonly args: string[]
	/** @ignore Spawn options. */
	readonly options: SpawnOptions
	/** Event emitter for the `stdout`. Emits the `data` event. */
	readonly stdout = new EventEmitter<OutputEvents<O>>()
	/** Event emitter for the `stderr`. Emits the `data` event. */
	readonly stderr = new EventEmitter<OutputEvents<O>>()

	/**
	 * @ignore
	 * Creates a new `Command` instance.
	 *
	 * @param program The program name to execute.
	 * It must be configured on `tauri.conf.json > plugins > shell > scope`.
	 * @param args Program arguments.
	 * @param options Spawn options.
	 */
	constructor(program: string, args: string | string[] = [], options?: SpawnOptions) {
		super()
		this.program = program
		this.args = typeof args === "string" ? [args] : args
		this.options = options ?? {}
	}
}

export class Command<O extends IOPayload> extends BaseShellCommand<O> {
	api: IShellServer

	constructor(
		program: string,
		args: string | string[] = [],
		api: IShellServer,
		options?: SpawnOptions
	) {
		super(program, args, options)
		this.api = api
	}

	async spawn(): Promise<Child> {
		const args = this.args

		if (typeof args === "object") {
			Object.freeze(args)
		}

		return this.api
			.rawSpawn(this.program, args, this.options, (evt) => {
				switch (evt.event) {
					case "Error":
						this.emit("error", evt.payload)
						break
					case "Terminated":
						this.emit("close", evt.payload)
						break
					case "Stdout":
						this.stdout.emit("data", evt.payload as O)
						break
					case "Stderr":
						this.stderr.emit("data", evt.payload as O)
						break
				}
			})
			.then(async (pid) => {
				await this.api.recordSpawnedProcess(pid) // report spawned process to main process for process auto cleanup
				return new Child(pid, this.api)
			})
	}

	async execute(): Promise<ChildProcess<O>> {
		const args = this.args
		if (typeof args === "object") {
			Object.freeze(args)
		}
		return this.api.execute(this.program, this.args, this.options) as Promise<ChildProcess<O>>
	}
}

export class DenoCommand<O extends IOPayload> extends BaseShellCommand<O> {
	config: DenoRunConfig
	scriptPath: string
	api: IShellServer

	constructor(scriptPath: string, args: string[], config: DenoRunConfig, api: IShellServer) {
		super("deno", args)
		this.config = config
		this.scriptPath = scriptPath
		this.api = api
	}

	execute(): Promise<ChildProcess<O>> {
		return this.api.denoExecute(this.scriptPath, this.config, this.args) as Promise<ChildProcess<O>>
	}

	spawn(): Promise<Child> {
		return this.api
			.denoRawSpawn(this.scriptPath, this.config, this.args, (evt) => {
				switch (evt.event) {
					case "Error":
						this.emit("error", evt.payload)
						break
					case "Terminated":
						this.emit("close", evt.payload)
						break
					case "Stdout":
						this.stdout.emit("data", evt.payload as O)
						break
					case "Stderr":
						this.stderr.emit("data", evt.payload as O)
						break
				}
			})
			.then(async (pid) => {
				await this.api.recordSpawnedProcess(pid)
				return new Child(pid, this.api)
			})
	}
}

export type IShell = {
	// Command: typeof Command
	// DenoCommand: typeof DenoCommand
	createCommand: (
		program: string,
		args: string | string[],
		options?: SpawnOptions
	) => Command<string>
	createDenoCommand: (
		scriptPath: string,
		args: string[],
		config: Partial<DenoRunConfig> & SpawnOptions
	) => DenoCommand<string>
	open: typeof shellxOpen
	makeBashScript: (script: string) => Command<string>
	makePowershellScript: (script: string) => Command<string>
	makeAppleScript: (script: string) => Command<string>
	makePythonScript: (script: string) => Command<string>
	makeZshScript: (script: string) => Command<string>
	makeNodeScript: (script: string) => Command<string>
	executeBashScript: (script: string) => Promise<ChildProcess<string>>
	executePowershellScript: (script: string) => Promise<ChildProcess<string>>
	executeAppleScript: (script: string) => Promise<ChildProcess<string>>
	executePythonScript: (script: string) => Promise<ChildProcess<string>>
	executeZshScript: (script: string) => Promise<ChildProcess<string>>
	executeNodeScript: (script: string) => Promise<ChildProcess<string>>
	hasCommand: typeof hasCommand
	likelyOnWindows: typeof likelyOnWindows
	Child: typeof Child
	TauriShellStdio: typeof TauriShellStdio
	createDenoRpcChannel<LocalAPI extends {}, RemoteAPI extends {}>(
		scriptPath: string,
		args: string[],
		config: Partial<DenoRunConfig> & SpawnOptions,
		localAPIImplementation: LocalAPI
	): Promise<{
		rpcChannel: RPCChannel<LocalAPI, RemoteAPI>
		process: Child
		command: DenoCommand<string>
	}>
	RPCChannel: typeof RPCChannel
	whereIsCommand: (command: string) => Promise<string | null>
}

export class TauriShellStdio implements IoInterface {
	name = "tauri-shell-stdio"
	constructor(
		private readStream: EventEmitter<OutputEvents<IOPayload>>, // stdout of child process
		private childProcess: Child
	) {}

	read(): Promise<string | Uint8Array | null> {
		return new Promise((resolve, reject) => {
			this.readStream.on("data", (chunk) => {
				resolve(chunk)
			})
		})
	}
	async write(data: string): Promise<void> {
		return this.childProcess.write(data + "\n")
	}
}

export function constructShellAPI(api: IShellServer): IShell {
	// const originalAPI = constructShellAPI1(api)
	function createCommand(program: string, args: string | string[] = [], options?: SpawnOptions) {
		return new Command<string>(program, args, api, options)
	}

	function createDenoCommand(
		scriptPath: string,
		args: string[],
		config: Partial<DenoRunConfig> & SpawnOptions
	) {
		return new DenoCommand<string>(scriptPath, args, config, api)
	}

	async function createDenoRpcChannel<LocalAPI extends {}, RemoteAPI extends {}>(
		scriptPath: string,
		args: string[],
		config: Partial<DenoRunConfig> & SpawnOptions,
		localAPIImplementation: LocalAPI
	) {
		const denoCmd = createDenoCommand(scriptPath, args, config)
		const denoProcess = await denoCmd.spawn()
		const stdio = new TauriShellStdio(denoCmd.stdout, denoProcess)
		const stdioRPC = new RPCChannel<LocalAPI, RemoteAPI>(stdio, { expose: localAPIImplementation })
		return {
			rpcChannel: stdioRPC,
			process: denoProcess,
			command: denoCmd
		}
	}

	function makeBashScript(script: string): Command<string> {
		return createCommand("bash", ["-c", script])
	}

	function makePowershellScript(script: string): Command<string> {
		return createCommand("powershell", ["-Command", script])
	}

	function makeAppleScript(script: string): Command<string> {
		return createCommand("osascript", ["-e", script])
	}

	function makePythonScript(script: string): Command<string> {
		return createCommand("python", ["-c", script])
	}

	function makeZshScript(script: string): Command<string> {
		return createCommand("zsh", ["-c", script])
	}

	function makeNodeScript(script: string): Command<string> {
		return createCommand("node", ["-e", script])
	}

	async function executeBashScript(script: string): Promise<ChildProcess<string>> {
		return makeBashScript(script).execute()
	}

	async function executePowershellScript(script: string): Promise<ChildProcess<string>> {
		return makePowershellScript(script).execute()
	}

	async function executeAppleScript(script: string): Promise<ChildProcess<string>> {
		return makeAppleScript(script).execute()
	}

	async function executePythonScript(script: string): Promise<ChildProcess<string>> {
		return makePythonScript(script).execute()
	}

	async function executeZshScript(script: string): Promise<ChildProcess<string>> {
		return makeZshScript(script).execute()
	}

	async function executeNodeScript(script: string): Promise<ChildProcess<string>> {
		return makeNodeScript(script).execute()
	}

	/**
	 * Run powershell.exe -Command 'echo $env:OS' to determine if the current platform is likely to be Windows.
	 * Not 100% accurate. If a Mac or Linux somehow has powershell.exe in PATH, this will return true.
	 * @returns Whether the current platform is likely to be Windows.
	 */
	function likelyOnWindows(): Promise<boolean> {
		// return createCommand("powershell.exe", ["-Command", "echo $env:OS"])
		// 	.execute()
		// 	.then((out) => out.code === 0 && out.stdout.toLowerCase().includes("windows"))
		// 	.catch(() => false)
		return api.likelyOnWindows()
	}

	return {
		open: api.open,
		makeBashScript,
		makePowershellScript,
		makeAppleScript,
		makePythonScript,
		makeZshScript,
		makeNodeScript,
		executeBashScript,
		executePowershellScript,
		executeAppleScript,
		executePythonScript,
		executeZshScript,
		executeNodeScript,
		hasCommand: api.hasCommand,
		likelyOnWindows,
		createCommand,
		createDenoCommand,
		Child,
		TauriShellStdio,
		createDenoRpcChannel,
		RPCChannel,
		whereIsCommand: api.whereIsCommand
	}
}

export { RPCChannel } from "kkrpc/browser"
