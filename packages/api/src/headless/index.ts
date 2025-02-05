import { RPCChannel, WorkerChildIO, type DestroyableIoInterface } from "kkrpc/browser"
import type {
	IClipboard,
	IDialog,
	// IEventInternal,
	IFetchInternal,
	// IFs,
	ILogger,
	INetwork,
	INotification,
	IOs,
	// IPath,
	IShellInternal,
	ISystemInfo,
	IUpdownload
} from "tauri-api-adapter"
import { constructFetchAPI, constructUpdownloadAPI } from "tauri-api-adapter/client"
import type {
	IApp,
	IDb,
	IEvent,
	IFs,
	IKV,
	IOpen,
	IPath,
	ISecurity,
	ISystem,
	IToast,
	IUtils
} from "../api/client"
import { constructEventAPI } from "../api/event"
import { constructPathAPI } from "../api/path"
import type { IShellServer } from "../api/server-types"
import { constructShellAPI } from "../api/shell"
import { constructToastAPI } from "../api/toast"
import type { HeadlessCommand } from "./ext"

/* -------------------------------------------------------------------------- */
/*                               API Interfaces                               */
/* -------------------------------------------------------------------------- */
export type {
	IClipboard,
	IDialog,
	ILogger,
	INetwork,
	INotification,
	IOs,
	IPath,
	// IShell,
	ISystemInfo,
	IUpdownload,
	IFetch
} from "tauri-api-adapter"
export type { ISystem, IToast, IUiIframe, IDb, IKV, IFs, IOpen, IEvent } from "../api/client"
export type { IShell } from "../api/shell"
export { HeadlessCommand } from "./ext"
/* -------------------------------------------------------------------------- */
/*                                     RPC                                    */
/* -------------------------------------------------------------------------- */
/**
 * For the APIs annotated with "inherit from tauri-api-adapter", they inherit the client API completely from tauri-api-adapter
 * There may be server API changes for them, but the client API can be inherited
 */
type API = {
	db: IDb // for kunkun
	kv: IKV // for kunkun
	system: ISystem // for kunkun
	open: IOpen // for kunkun
	clipboard: IClipboard // inherit from tauri-api-adapter
	dialog: IDialog // inherit from tauri-api-adapter
	fetch: IFetchInternal // inherit from tauri-api-adapter
	event: IEvent // for kunkun, override tauri-api-adapter's event API, expose only specified event, disallow, emit and listen
	fs: IFs // customized for kunkun, add file search API on top of tauri-api-adapter's fs API
	log: ILogger // inherit from tauri-api-adapter
	notification: INotification // inherit from tauri-api-adapter
	toast: IToast // for kunkun
	os: IOs // inherit from tauri-api-adapter
	path: IPath // inherit from tauri-api-adapter
	shell: IShellServer // inherit from tauri-api-adapter
	updownload: IUpdownload // inherit from tauri-api-adapter
	sysInfo: ISystemInfo // inherit from tauri-api-adapter
	network: INetwork // inherit from tauri-api-adapter
	security: ISecurity // for kunkun
	utils: IUtils // for kunkun
	app: IApp
}
const io = new WorkerChildIO()
const rpc = new RPCChannel<{}, API, DestroyableIoInterface>(io, {})
export const api = rpc.getAPI()
export function expose(api: HeadlessCommand) {
	rpc.expose(api)
}

export const event = constructEventAPI(api.event) // this is different from event api from tauri-api-adapter
export const fetch = constructFetchAPI(api.fetch)
export const path = constructPathAPI(api.path)
export const shell = constructShellAPI(api.shell)
export const toast = constructToastAPI(api.toast)
export const updownload = constructUpdownloadAPI(api.updownload)
export const {
	db,
	kv,
	os,
	clipboard,
	dialog,
	fs,
	log,
	notification,
	sysInfo,
	network,
	system,
	open,
	utils,
	app,
	security
} = api
export { Child, RPCChannel, Command, DenoCommand } from "../api/shell"
