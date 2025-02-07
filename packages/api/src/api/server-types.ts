import { type IShellServer as IShellServer1 } from "tauri-api-adapter"
import type {
	ChildProcess,
	CommandEvent,
	InternalSpawnOptions,
	IOPayload,
	SpawnOptions
} from "tauri-plugin-shellx-api"
import type { DenoRunConfig, IUiCustom } from "./client"

export type IShellServer = IShellServer1 & {
	denoExecute(
		scriptPath: string,
		config: Partial<DenoRunConfig> & SpawnOptions,
		args: string[]
	): Promise<ChildProcess<IOPayload>>
	denoRawSpawn<O extends IOPayload>(
		scriptPath: string,
		config: Partial<DenoRunConfig> & SpawnOptions,
		args: string[],
		cb: (evt: CommandEvent<O>) => void
	): Promise<number>
	recordSpawnedProcess(pid: number): Promise<void>
	whereIsCommand(command: string): Promise<string | null>
}

// This will be implemented in the @kksh/api package
export type IUiCustomServer1 = Pick<
	IUiCustom,
	"startDragging" | "toggleMaximize" | "internalToggleMaximize"
>
// This interface will be implemented in iframe-ext.vue where iframe is loaded and API is exposed
// because these API dependes on the context of the page
export type IUiCustomServer2 = Omit<
	IUiCustom,
	"registerDragRegion" | "internalToggleMaximize" | "toggleMaximize" | "startDragging"
>
