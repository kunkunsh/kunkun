import { checkPermission } from "tauri-api-adapter/permissions"
import {
	ejectAllDisks,
	emptyTrash,
	getFrontmostApp,
	getSelectedFilesInFileExplorer,
	hideAllAppsExceptFrontmost,
	logoutUser,
	mute,
	openTrash,
	quitAllApps,
	reboot,
	setVolume,
	setVolumeTo0,
	setVolumeTo25,
	setVolumeTo50,
	setVolumeTo75,
	setVolumeTo100,
	showDesktop,
	shutdown,
	sleep,
	sleepDisplays,
	toggleBluetooth,
	toggleHiddenFiles,
	toggleMute,
	toggleStageManager,
	toggleSystemAppearance,
	turnVolumeDown,
	turnVolumeUp,
	unmute
} from "../../commands/system"
import {
	AllKunkunPermission,
	type FsPermissionScoped,
	type KunkunFsPermission,
	type SystemPermission
} from "../../permissions"
import { SystemPermissionMap } from "../../permissions/permission-map"
import type { ISystem } from "../client"

export function constructSystemApi(permissions: SystemPermission[]): ISystem {
	return {
		openTrash: checkPermission<SystemPermission>(
			SystemPermissionMap.openTrash,
			permissions
		)(openTrash),
		emptyTrash: checkPermission<SystemPermission>(
			SystemPermissionMap.emptyTrash,
			permissions
		)(emptyTrash),
		shutdown: checkPermission<SystemPermission>(
			SystemPermissionMap.shutdown,
			permissions
		)(shutdown),
		reboot: checkPermission<SystemPermission>(SystemPermissionMap.reboot, permissions)(reboot),
		sleep: checkPermission<SystemPermission>(SystemPermissionMap.sleep, permissions)(sleep),
		toggleSystemAppearance: checkPermission<SystemPermission>(
			SystemPermissionMap.toggleSystemAppearance,
			permissions
		)(toggleSystemAppearance),
		showDesktop: checkPermission<SystemPermission>(
			SystemPermissionMap.showDesktop,
			permissions
		)(showDesktop),
		quitAllApps: checkPermission<SystemPermission>(
			SystemPermissionMap.quitAllApps,
			permissions
		)(quitAllApps),
		sleepDisplays: checkPermission<SystemPermission>(
			SystemPermissionMap.sleepDisplays,
			permissions
		)(sleepDisplays),
		setVolume: checkPermission<SystemPermission>(
			SystemPermissionMap.setVolume,
			permissions
		)(setVolume),
		setVolumeTo0: checkPermission<SystemPermission>(
			SystemPermissionMap.setVolumeTo0,
			permissions
		)(setVolumeTo0),
		setVolumeTo25: checkPermission<SystemPermission>(
			SystemPermissionMap.setVolumeTo25,
			permissions
		)(setVolumeTo25),
		setVolumeTo50: checkPermission<SystemPermission>(
			SystemPermissionMap.setVolumeTo50,
			permissions
		)(setVolumeTo50),
		setVolumeTo75: checkPermission<SystemPermission>(
			SystemPermissionMap.setVolumeTo75,
			permissions
		)(setVolumeTo75),
		setVolumeTo100: checkPermission<SystemPermission>(
			SystemPermissionMap.setVolumeTo100,
			permissions
		)(setVolumeTo100),
		turnVolumeUp: checkPermission<SystemPermission>(
			SystemPermissionMap.turnVolumeUp,
			permissions
		)(turnVolumeUp),
		turnVolumeDown: checkPermission<SystemPermission>(
			SystemPermissionMap.turnVolumeDown,
			permissions
		)(turnVolumeDown),
		toggleStageManager: checkPermission<SystemPermission>(
			SystemPermissionMap.toggleStageManager,
			permissions
		)(toggleStageManager),
		toggleBluetooth: checkPermission<SystemPermission>([], permissions)(toggleBluetooth),
		toggleHiddenFiles: checkPermission<SystemPermission>(
			SystemPermissionMap.toggleHiddenFiles,
			permissions
		)(toggleHiddenFiles),
		ejectAllDisks: checkPermission<SystemPermission>(
			SystemPermissionMap.ejectAllDisks,
			permissions
		)(ejectAllDisks),
		logoutUser: checkPermission<SystemPermission>(
			SystemPermissionMap.logoutUser,
			permissions
		)(logoutUser),
		toggleMute: checkPermission<SystemPermission>(
			SystemPermissionMap.toggleMute,
			permissions
		)(toggleMute),
		mute: checkPermission<SystemPermission>(SystemPermissionMap.mute, permissions)(mute),
		unmute: checkPermission<SystemPermission>(SystemPermissionMap.unmute, permissions)(unmute),
		getFrontmostApp: checkPermission<SystemPermission>(
			SystemPermissionMap.getFrontmostApp,
			permissions
		)(getFrontmostApp),
		hideAllAppsExceptFrontmost: checkPermission<SystemPermission>(
			SystemPermissionMap.hideAllAppsExceptFrontmost,
			permissions
		)(hideAllAppsExceptFrontmost),
		getSelectedFilesInFileExplorer: checkPermission<SystemPermission>(
			SystemPermissionMap.getSelectedFilesInFileExplorer,
			permissions
		)(getSelectedFilesInFileExplorer)
	}
}

// all enabled by default
// export const defaultSystemApi = constructSystemApi([
// 	"system:volumn",
// 	"system:boot",
// 	"system:disk",
// 	"system:apps",
// 	"system:fs"
// ])
