import type { IShellServer } from "tauri-api-adapter"
// import type { IEventServer, IFsServer, ISystemServer } from "../ui/server/server-types"
import type { IEvent, IFs, ISecurity, ISystem } from "../ui/client"
import type {
	EventPermission,
	KunkunFsPermission,
	SecurityPermission,
	ShellPermission,
	SystemPermission
} from "./schema"

/* -------------------------------------------------------------------------- */
/*                                  Re-export                                 */
/* -------------------------------------------------------------------------- */
export {
	ClipboardPermissionMap,
	DialogPermissionMap,
	NotificationPermissionMap,
	// FsPermissionMap,
	OsPermissionMap,
	FetchPermissionMap,
	SystemInfoPermissionMap,
	// ShellPermissionMap, // we defined a custom one below
	UpdownloadPermissionMap
} from "tauri-api-adapter/permissions"

export const SecurityPermissionMap: {
	mac: Record<keyof ISecurity["mac"], SecurityPermission[]>
} = {
	mac: {
		revealSecurityPane: ["security:mac:all", "security:mac:reveal-security-pane"],
		verifyFingerprint: ["security:mac:all", "security:mac:verify-fingerprint"],
		requestScreenCapturePermission: ["security:mac:all", "security:mac:request-permission"],
		checkScreenCapturePermission: ["security:mac:all", "security:mac:check-permission"],
		resetPermission: ["security:mac:all", "security:mac:reset-screencapture-permission"]
	}
}

export const FsPermissionMap: Record<keyof IFs, KunkunFsPermission[]> = {
	readDir: ["fs:read", "fs:read-dir"],
	readFile: ["fs:read"],
	readTextFile: ["fs:read"],
	stat: ["fs:stat", "fs:read"],
	lstat: ["fs:stat", "fs:read"],
	exists: ["fs:exists", "fs:read"],
	mkdir: ["fs:write"],
	create: ["fs:write"],
	copyFile: ["fs:write"],
	remove: ["fs:write"],
	rename: ["fs:write"],
	truncate: ["fs:write"],
	writeFile: ["fs:write"],
	writeTextFile: ["fs:write"],
	fileSearch: ["fs:search"]
}

export const SystemPermissionMap: Record<keyof ISystem, SystemPermission[]> = {
	openTrash: [],
	emptyTrash: ["system:fs"],
	shutdown: ["system:boot"],
	reboot: ["system:boot"],
	sleep: ["system:boot"],
	toggleSystemAppearance: ["system:ui"],
	showDesktop: ["system:ui"],
	quitAllApps: ["system:apps"],
	sleepDisplays: ["system:boot"],
	setVolume: ["system:volumn"],
	setVolumeTo0: ["system:volumn"],
	setVolumeTo25: ["system:volumn"],
	setVolumeTo50: ["system:volumn"],
	setVolumeTo75: ["system:volumn"],
	setVolumeTo100: ["system:volumn"],
	turnVolumeUp: ["system:volumn"],
	turnVolumeDown: ["system:volumn"],
	toggleStageManager: ["system:ui"],
	toggleBluetooth: [],
	toggleHiddenFiles: ["system:ui"],
	ejectAllDisks: ["system:disk"],
	logoutUser: ["system:boot"],
	toggleMute: ["system:volumn"],
	mute: ["system:volumn"],
	unmute: ["system:volumn"],
	getFrontmostApp: ["system:apps"],
	hideAllAppsExceptFrontmost: ["system:apps"],
	getSelectedFilesInFileExplorer: ["system:fs"]
}

export const EventPermissionMap: Record<keyof IEvent, EventPermission[]> = {
	onDragDrop: ["event:drag-drop"],
	onDragEnter: ["event:drag-enter"],
	onDragLeave: ["event:drag-leave"],
	onDragOver: ["event:drag-over"],
	onWindowBlur: ["event:window-blur"],
	onWindowCloseRequested: ["event:window-close-requested"],
	onWindowFocus: ["event:window-focus"]
}

export const ShellPermissionMap: Record<keyof IShellServer, ShellPermission[]> = {
	execute: ["shell:all", "shell:execute"],
	kill: ["shell:all", "shell:kill"],
	stdinWrite: ["shell:all", "shell:stdin-write", "shell:execute"],
	open: ["shell:all", "shell:open"],
	rawSpawn: ["shell:all", "shell:spawn"],
	executeBashScript: ["shell:all", "shell:execute"],
	executePowershellScript: ["shell:all", "shell:execute"],
	executeAppleScript: ["shell:all", "shell:execute"],
	executePythonScript: ["shell:all", "shell:execute"],
	executeZshScript: ["shell:all", "shell:execute"],
	executeNodeScript: ["shell:all", "shell:execute"],
	hasCommand: [],
	likelyOnWindows: ["shell:all", "shell:execute"]
}
