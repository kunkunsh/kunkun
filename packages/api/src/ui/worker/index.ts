/* -------------------------------------------------------------------------- */
/*                                     API                                    */
/* -------------------------------------------------------------------------- */
import { wrap, type Endpoint, type Remote } from "@huakunshen/comlink"
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
import {
	constructFetchAPI,
	// constructPathAPI,
	// constructShellAPI,
	constructUpdownloadAPI
} from "tauri-api-adapter/client"
import { constructEventAPI } from "../api/event"
import { constructPathAPI } from "../api/path"
import { constructShellAPI } from "../api/shell"
import { constructToastAPI } from "../api/toast"
import type {
	IApp,
	IDb,
	IEvent,
	IFs,
	IOpen,
	IPath,
	ISecurity,
	ISystem,
	IToast,
	IUiWorker,
	IUtils
} from "../client"
import type { IShellServer } from "../server/server-types"

export { expose, wrap } from "@huakunshen/comlink"
export { WorkerExtension } from "./ext"
export type { IDb } from "../client"
/**
 * For the APIs annotated with "inherit from tauri-api-adapter", they inherit the client API completely from tauri-api-adapter
 * There may be server API changes for them, but the client API can be inherited
 */
type API = {
	db: Remote<IDb> // for kunkun
	system: Remote<ISystem> // for kunkun
	open: Remote<IOpen> // for kunkun
	clipboard: Remote<IClipboard> // inherit from tauri-api-adapter
	dialog: Remote<IDialog> // inherit from tauri-api-adapter
	fetch: Remote<IFetchInternal> // inherit from tauri-api-adapter
	event: Remote<IEvent> // for kunkun, override tauri-api-adapter's event API, expose only specified event, disallow, emit and listen
	fs: Remote<IFs> // customized for kunkun, add file search API on top of tauri-api-adapter's fs API
	log: Remote<ILogger> // inherit from tauri-api-adapter
	notification: Remote<INotification> // inherit from tauri-api-adapter
	toast: Remote<IToast> // for kunkun
	os: Remote<IOs> // inherit from tauri-api-adapter
	path: Remote<IPath> // inherit from tauri-api-adapter
	shell: Remote<IShellServer> // inherit from tauri-api-adapter
	updownload: IUpdownload // inherit from tauri-api-adapter
	sysInfo: Remote<ISystemInfo> // inherit from tauri-api-adapter
	network: Remote<INetwork> // inherit from tauri-api-adapter
	workerUi: Remote<IUiWorker> // for kunkun
	security: ISecurity // for kunkun
	utils: IUtils // for kunkun
	app: IApp
}

const _api = wrap(globalThis as Endpoint) as unknown as API
export const event = constructEventAPI(_api.event) // this is different from event api from tauri-api-adapter
export const fetch = constructFetchAPI(_api.fetch)
export const path = constructPathAPI(_api.path)
export const shell = constructShellAPI(_api.shell)
export const toast = constructToastAPI(_api.toast)
export const updownload = constructUpdownloadAPI(_api.updownload)
export const {
	db,
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
	security,
	workerUi: ui
} = _api
export { Child, RPCChannel, Command, DenoCommand } from "../api/shell"
/* -------------------------------------------------------------------------- */
/*                             UI Component Schema                            */
/* -------------------------------------------------------------------------- */
export { type IComponent } from "./components"
export * as ListSchema from "./schema/list"
export * as FormSchema from "./schema/form"
export { Markdown as MarkdownSchema } from "./schema/markdown"

export { List, Action, Form, Markdown } from "./components"
export * from "../../models/styles"
export { Icon } from "./components/icon"
export { IconEnum, IconType, IconNode } from "../../models/icon"
export * as schema from "./schema"
export { NodeName, NodeNameEnum, FormNodeName, FormNodeNameEnum } from "../../models/constants"
