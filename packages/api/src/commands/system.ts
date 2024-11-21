import { generateJarvisPluginCommand } from "@kksh/api/commands"
import { AppInfo, IconEnum, SysCommand } from "@kksh/api/models"
import { invoke } from "@tauri-apps/api/core"
import { platform } from "@tauri-apps/plugin-os"
import { parse } from "valibot"

export function openTrash(): Promise<void> {
	return invoke(generateJarvisPluginCommand("open_trash"))
}

export function emptyTrash(): Promise<void> {
	return invoke(generateJarvisPluginCommand("empty_trash"))
}

export function shutdown(): Promise<void> {
	return invoke(generateJarvisPluginCommand("shutdown"))
}

export function reboot(): Promise<void> {
	return invoke(generateJarvisPluginCommand("reboot"))
}

export function sleep(): Promise<void> {
	return invoke(generateJarvisPluginCommand("sleep"))
}

export function toggleSystemAppearance(): Promise<void> {
	return invoke(generateJarvisPluginCommand("toggle_system_appearance"))
}

export function showDesktop(): Promise<void> {
	return invoke(generateJarvisPluginCommand("show_desktop"))
}

export function quitAllApps(): Promise<void> {
	return invoke(generateJarvisPluginCommand("quit_app_apps"))
}

export function sleepDisplays(): Promise<void> {
	return invoke(generateJarvisPluginCommand("sleep_displays"))
}

export function setVolume(percentage: number): Promise<void> {
	return invoke(generateJarvisPluginCommand("set_volume"), { percentage })
}

export function setVolumeTo0(): Promise<void> {
	return setVolume(0)
}

export function setVolumeTo25(): Promise<void> {
	return setVolume(25)
}

export function setVolumeTo50(): Promise<void> {
	return setVolume(50)
}

export function setVolumeTo75(): Promise<void> {
	return setVolume(75)
}

export function setVolumeTo100(): Promise<void> {
	return setVolume(100)
}

export function turnVolumeUp(): Promise<void> {
	return invoke(generateJarvisPluginCommand("turn_volume_up"))
}

export function turnVolumeDown(): Promise<void> {
	return invoke(generateJarvisPluginCommand("turn_volume_down"))
}

export function toggleStageManager(): Promise<void> {
	return invoke(generateJarvisPluginCommand("toggle_stage_manager"))
}

export function toggleBluetooth(): Promise<void> {
	return invoke(generateJarvisPluginCommand("toggle_bluetooth"))
}

export function toggleHiddenFiles(): Promise<void> {
	return invoke(generateJarvisPluginCommand("toggle_hidden_files"))
}

export function ejectAllDisks(): Promise<void> {
	return invoke(generateJarvisPluginCommand("eject_all_disks"))
}

export function logoutUser(): Promise<void> {
	return invoke(generateJarvisPluginCommand("logout_user"))
}

export function toggleMute(): Promise<void> {
	return invoke(generateJarvisPluginCommand("toggle_mute"))
}

export function mute(): Promise<void> {
	return invoke(generateJarvisPluginCommand("mute"))
}

export function unmute(): Promise<void> {
	return invoke(generateJarvisPluginCommand("unmute"))
}

export function getFrontmostApp(): Promise<AppInfo> {
	return invoke(generateJarvisPluginCommand("get_frontmost_app")).then((app) => parse(AppInfo, app))
}

export function hideAllAppsExceptFrontmost(): Promise<void> {
	return invoke(generateJarvisPluginCommand("hide_all_apps_except_frontmost"))
}

export function getSelectedFilesInFileExplorer(): Promise<string[]> {
	return invoke(generateJarvisPluginCommand("get_selected_files_in_file_explorer"))
}

export const rawSystemCommands = [
	{
		name: "Open Trash",
		icon: {
			value: "uil:trash",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: openTrash,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Empty Trash",
		icon: {
			value: "uil:trash",
			type: IconEnum.Iconify
		},
		confirmRequired: true,
		function: emptyTrash,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Shutdown",
		icon: {
			value: "mdi:shutdown",
			type: IconEnum.Iconify
		},
		confirmRequired: true,
		function: shutdown,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Reboot",
		icon: {
			value: "mdi:restart",
			type: IconEnum.Iconify
		},
		confirmRequired: true,
		function: reboot,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Sleep",
		icon: {
			value: "carbon:asleep",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: sleep,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Toggle System Appearance",
		icon: {
			value: "line-md:light-dark",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: toggleSystemAppearance,
		platforms: ["macos"]
	},
	{
		name: "Show Desktop",
		icon: {
			value: "bi:window-desktop",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: showDesktop,
		platforms: ["macos"]
	},
	{
		name: "Quit App",
		icon: {
			value: "charm:cross",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: quitAllApps,
		platforms: []
		// platforms: ["macos"]
	},
	{
		name: "Sleep Displays",
		icon: {
			value: "solar:display-broken",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: sleepDisplays,
		platforms: ["macos"]
	},
	{
		name: "Set Volume to 0%",
		icon: {
			value: "flowbite:volume-mute-outline",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: setVolumeTo0,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Set Volume to 25%",
		icon: {
			value: "flowbite:volume-down-solid",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: setVolumeTo25,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Set Volume to 50%",
		icon: {
			value: "flowbite:volume-down-solid",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: setVolumeTo50,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Set Volume to 75%",
		icon: {
			value: "flowbite:volume-down-solid",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: setVolumeTo75,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Set Volume to 100%",
		icon: {
			value: "flowbite:volume-up-solid",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: setVolumeTo100,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Turn Volume Up",
		icon: {
			value: "flowbite:volume-up-solid",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: turnVolumeUp,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Turn Volume Down",
		icon: {
			value: "flowbite:volume-down-outline",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: turnVolumeDown,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Toggle Mute",
		icon: {
			value: "flowbite:volume-down-outline",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: toggleMute,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Mute",
		icon: {
			value: "flowbite:volume-mute-solid",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: mute,
		platforms: ["macos", "linux"]
	},
	{
		name: "Unmute",
		icon: {
			value: "flowbite:volume-mute-solid",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: unmute,
		platforms: ["macos", "linux"]
	},
	{
		name: "Toggle Stage Manager",
		icon: {
			value: "material-symbols:dashboard",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: toggleStageManager,
		platforms: []
	},
	{
		name: "Toggle Bluetooth",
		icon: {
			value: "material-symbols:bluetooth",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: toggleBluetooth,
		platforms: []
	},
	{
		name: "Toggle Hidden Files",
		icon: {
			value: "mdi:hide",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: toggleHiddenFiles,
		platforms: []
	},
	{
		name: "Eject All Disks",
		icon: {
			value: "ph:eject-fill",
			type: IconEnum.Iconify
		},
		confirmRequired: true,
		function: ejectAllDisks,
		platforms: ["macos"]
	},
	{
		name: "Log Out User",
		icon: {
			value: "ic:baseline-logout",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: logoutUser,
		platforms: ["macos", "linux", "windows"]
	},
	{
		name: "Hide All Apps Except Frontmost",
		icon: {
			value: "mdi:hide",
			type: IconEnum.Iconify
		},
		confirmRequired: false,
		function: hideAllAppsExceptFrontmost,
		platforms: []
	}
]

export function getSystemCommands(): SysCommand[] {
	return rawSystemCommands
		.filter(async (cmd) => cmd.platforms.includes(platform())) // Filter out system commands that are not supported on the current platform
		.map((cmd) => ({
			name: cmd.name,
			value: "system-cmd" + cmd.name.split(" ").join("-").toLowerCase(),
			icon: cmd.icon,
			keywords: cmd.name.split(" "),
			function: cmd.function,
			confirmRequired: cmd.confirmRequired
		}))
}
