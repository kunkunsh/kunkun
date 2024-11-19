/* -------------------------------------------------------------------------- */
/*                                     API                                    */
/* -------------------------------------------------------------------------- */
// export {
// 	clipboard,
// 	dialog,
// 	// event,
// 	network,
// 	fs,
// 	notification,
// 	os,
// 	shell,
// 	sysInfo,
// 	path,
// 	log,
// 	updownload,
// 	fetch
// } from "tauri-api-adapter"
export { constructJarvisServerAPIWithPermissions } from "./server"
// export { type IUiWorkerServer, type IUiIframeServer } from "./server/ui"
export * from "./client" // all client types
// export { expose, wrap } from "@huakunshen/comlink"
// export { getWorkerApiClient, exposeApiToWorker, exposeApiToWindow } from "tauri-api-adapter"

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
export type { ISystem, IToast, IUiWorker, IUiIframe, IDb, IFs, IOpen, IEvent } from "../ui/client"
export type { IShell } from "./api/shell"
