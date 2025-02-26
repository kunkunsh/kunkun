// import { windowEndpoint, wrap, type Remote } from "@huakunshen/comlink"
import { IframeChildIO, RPCChannel, type DestroyableIoInterface } from "kkrpc/browser"
import type {
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
import {
	constructFetchAPI,
	// constructPathAPI,
	constructUpdownloadAPI
} from "tauri-api-adapter/client"
import type {
	IApp,
	IClipboard,
	IDb,
	IEvent,
	IFs,
	IHelper,
	IKV,
	IOpen,
	IPath,
	ISecurity,
	ISystem,
	IToast,
	IUiCustom,
	IUtils
} from "../../api/client"
import { constructEventAPI } from "../../api/event"
import { constructIframeUiAPI } from "../../api/iframe-ui"
import { constructPathAPI } from "../../api/path"
import type { IShellServer } from "../../api/server-types"
import { constructShellAPI } from "../../api/shell"

export { type IUiCustom } from "../../api/client"
// export { expose, wrap } from "@huakunshen/comlink"
// export { type IDbServer } from "../server/db"
export { type IUiCustomServer2, type IUiCustomServer1 } from "../../api/server-types"

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
	iframeUi: IUiCustom // for kunkun
	utils: IUtils // for kunkun
	security: ISecurity // for kunkun
	helper: IHelper // for kunkun
	app: IApp
}
// export const api = wrap(windowEndpoint(globalThis.parent)) as unknown as API
const io = new IframeChildIO()
const rpc = new RPCChannel<{}, API, DestroyableIoInterface>(io, {})
export const api = rpc.getAPI()

export const event = constructEventAPI(api.event) // this is different from event api from tauri-api-adapter
export const fetch = constructFetchAPI(api.fetch)
export const path = constructPathAPI(api.path)
export const shell = constructShellAPI(api.shell)
export const updownload = constructUpdownloadAPI(api.updownload)
export const ui = constructIframeUiAPI(api)
export const {
	db,
	os,
	clipboard,
	kv,
	dialog,
	fs,
	log,
	notification,
	sysInfo,
	network,
	system,
	toast,
	utils,
	open,
	app,
	helper
} = api
export { Child, RPCChannel, Command, DenoCommand } from "../../api/shell"
