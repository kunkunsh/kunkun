import {
	constructClipboardApi,
	constructDialogApi,
	constructFetchApi,
	// constructFsApi, // a local constructFsApi is defined
	constructLoggerApi,
	constructNetworkApi,
	constructNotificationApi,
	constructOsApi,
	// constructPathApi,
	// constructShellApi, // a local custom constructShellApi is defined
	constructSystemInfoApi,
	constructUpdownloadApi,
	type IClipboard,
	type IDialog,
	type IFetchInternal,
	type ILogger,
	type INetwork,
	type INotification,
	type IOs,
	type IPath,
	type IShell,
	type IShellServer,
	type ISystemInfo,
	type IUpdownload
} from "tauri-api-adapter"
import { type IFetch } from "tauri-api-adapter/client"
import {
	checkPermission,
	type ClipboardPermission,
	type DialogPermission,
	type FetchPermission,
	type NetworkPermission,
	type NotificationPermission,
	type OsPermission,
	// type ShellPermission,
	type SystemInfoPermission,
	type UpdownloadPermission
} from "tauri-api-adapter/permissions"
import {
	AllKunkunPermission,
	type EventPermission,
	type FsPermissionScoped,
	type KunkunFsPermission,
	type OpenPermissionScoped,
	type SecurityPermission,
	type ShellPermission,
	type ShellPermissionScoped,
	type SystemPermission
} from "../../permissions"
import type { IEvent, IFs, IOpen, ISecurity, ISystem, IToast, IUtils } from "../client"
// import type { IDbServer } from "./db"
import { constructEventApi } from "./event"
import { constructFsApi } from "./fs"
import { constructOpenApi } from "./open"
import { constructPathApi } from "./path"
import { constructSecurityAPI } from "./security"
import type { IUiIframeServer1 } from "./server-types"
// import type { IFsServer, ISystemServer } from "./server-types"
import { constructShellApi } from "./shell"
import { constructSystemApi } from "./system"
import {
	constructToastApi
	// type IToastServer
} from "./toast"
import {
	constructIframeUiApi
	// type IUiIframeServer,
	// type IUiWorkerServer
} from "./ui"
import { constructUtilsApi } from "./utils"

// export type { IDbServer } from "./db"
export { constructFsApi } from "./fs"
export { constructSystemApi } from "./system"
export {
	constructToastApi
	// type IToastServer
} from "./toast"
export {
	constructIframeUiApi
	// type IUiIframeServer,
	// type IUiWorkerServer
} from "./ui"

// export type IJarvisFullAPI =
// 	// IFullAPI &
// 	ISystemServer & IToastServer & IDbServer & IUiWorkerServer & IUiIframeServer & IFsServer // IFsServer will override some methods in IFullAPI, it's fine because it's a superset
type AllScopedPermissions = FsPermissionScoped | OpenPermissionScoped | ShellPermissionScoped
type AllPermissions = AllKunkunPermission | AllScopedPermissions
function getStringPermissions(permissions: AllPermissions[]): AllKunkunPermission[] {
	return permissions.filter((p) => typeof p === "string") as AllKunkunPermission[]
}

function getObjectPermissions(permissions: AllPermissions[]): AllScopedPermissions[] {
	return permissions.filter((p) => typeof p !== "string")
}

export type IKunkunFullServerAPI = {
	clipboard: IClipboard
	fetch: IFetchInternal
	dialog: IDialog
	event: IEvent
	fs: IFs
	log: ILogger
	path: Omit<IPath, "BaseDirectory"> // BaseDirectory is only on Client side, not on Server side
	notification: INotification
	os: IOs
	updownload: IUpdownload
	sysInfo: ISystemInfo
	network: INetwork
	open: IOpen
	system: ISystem
	toast: IToast
	shell: IShellServer
	iframeUi: IUiIframeServer1
	utils: IUtils
	security: ISecurity
}

/**
 * Construct Jarvis Server API with permissions constraints
 * @param permissions all permissions user has
 * @param extPath absolute path to the extension
 * @returns
 */
export function constructJarvisServerAPIWithPermissions(
	permissions: AllPermissions[],
	extPath: string
): IKunkunFullServerAPI {
	return {
		clipboard: constructClipboardApi(
			getStringPermissions(permissions).filter((p) =>
				p.startsWith("clipboard:")
			) as ClipboardPermission[]
		),
		fetch: constructFetchApi(
			getStringPermissions(permissions).filter((p) => p.startsWith("fetch:")) as FetchPermission[]
		),
		dialog: constructDialogApi(
			getStringPermissions(permissions).filter((p) => p.startsWith("dialog:")) as DialogPermission[]
		),
		event: constructEventApi(
			getStringPermissions(permissions).filter((p) => p.startsWith("event:")) as EventPermission[]
		), // this one is not from tauri-api-adapter, it's a custom one defined in this project, only limited events are exposed
		fs: constructFsApi(
			(getObjectPermissions(permissions) as FsPermissionScoped[]).filter((p) =>
				p.permission.startsWith("fs:")
			),
			extPath
		),
		log: constructLoggerApi(),
		path: constructPathApi(extPath),
		notification: constructNotificationApi(
			getStringPermissions(permissions).filter((p) =>
				p.startsWith("notification:")
			) as NotificationPermission[]
		),
		os: constructOsApi(
			getStringPermissions(permissions).filter((p) => p.startsWith("os:")) as OsPermission[]
		),
		updownload: constructUpdownloadApi(
			getStringPermissions(permissions).filter((p) =>
				p.startsWith("updownload:")
			) as UpdownloadPermission[]
		),
		network: constructNetworkApi(
			getStringPermissions(permissions).filter((p) =>
				p.startsWith("network:")
			) as NetworkPermission[]
		),
		open: constructOpenApi(
			(getObjectPermissions(permissions) as OpenPermissionScoped[]).filter((p) =>
				p.permission.startsWith("open:")
			),
			extPath
		),
		sysInfo: constructSystemInfoApi(
			getStringPermissions(permissions).filter((p) =>
				p.startsWith("system-info:")
			) as SystemInfoPermission[]
		),
		system: constructSystemApi(
			getStringPermissions(permissions).filter((p) => p.startsWith("system:")) as SystemPermission[]
		),
		toast: constructToastApi(),
		shell: constructShellApi(
			[
				...(getStringPermissions(permissions).filter((p) =>
					p.startsWith("shell:")
				) as ShellPermission[]),
				...(getObjectPermissions(permissions) as ShellPermissionScoped[]).filter((p) =>
					p.permission.startsWith("shell:")
				)
			],
			extPath
		),
		iframeUi: constructIframeUiApi(),
		utils: constructUtilsApi(),
		security: constructSecurityAPI(
			getStringPermissions(permissions).filter((p) =>
				p.startsWith("security:")
			) as SecurityPermission[]
		)
	}
}
