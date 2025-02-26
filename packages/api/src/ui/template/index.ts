/* -------------------------------------------------------------------------- */
/*                                     API                                    */
/* -------------------------------------------------------------------------- */
// import { wrap, type Endpoint, type Remote } from "@huakunshen/comlink"
// import { RPCChannel, WorkerChildIO, type DestroyableIoInterface } from "kkrpc/browser"
import { RPCChannel, WorkerChildIO, type DestroyableIoInterface } from "kkrpc/browser"
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
	// constructShellAPI,
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
	IUtils
} from "../../api/client"
import { constructEventAPI } from "../../api/event"
import { constructPathAPI } from "../../api/path"
import type { IShellServer } from "../../api/server-types"
import { constructShellAPI } from "../../api/shell"
import { constructToastAPI } from "../../api/toast"
import type { FormSchema, ListSchema, MarkdownSchema } from "../../models"
import type { IComponent } from "./components"
import type { TemplateUiCommand } from "./ext"

export interface IUiTemplate {
	render: (view: IComponent<ListSchema.List | FormSchema.Form | MarkdownSchema>) => Promise<void>
	goBack: () => Promise<void>
	showLoadingBar: (loading: boolean) => Promise<void>
	setScrollLoading: (loading: boolean) => Promise<void>
	setSearchTerm: (term: string) => Promise<void>
	setSearchBarPlaceholder: (placeholder: string) => Promise<void>
	setProgressBar: (progress: number | null) => Promise<void>
}

// export { expose, wrap } from "@huakunshen/comlink"
export { TemplateUiCommand } from "./ext"
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
	workerUi: IUiTemplate // for kunkun
	helper: IHelper
	security: ISecurity // for kunkun
	utils: IUtils // for kunkun
	app: IApp
}

/* -------------------------------------------------------------------------- */
/*                                   Expose                                   */
/* -------------------------------------------------------------------------- */
const io = new WorkerChildIO()
const rpc = new RPCChannel<{}, API, DestroyableIoInterface>(io, {})
export const api = rpc.getAPI()

export function expose(api: TemplateUiCommand) {
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
	security,
	helper,
	workerUi: ui
} = api
export { Child, RPCChannel, Command, DenoCommand } from "../../api/shell"
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
