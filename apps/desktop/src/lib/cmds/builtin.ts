import { appConfig, appState, auth } from "@/stores"
import { checkUpdateAndInstall } from "@/utils/updater"
import type { BuiltinCmd } from "@kksh/ui/types"
import { getVersion } from "@tauri-apps/api/app"
import { WebviewWindow } from "@tauri-apps/api/webviewWindow"
import { exit } from "@tauri-apps/plugin-process"
import { goto } from "$app/navigation"
import { toast } from "svelte-sonner"
import { v4 as uuidv4 } from "uuid"

export const builtinCmds: BuiltinCmd[] = [
	{
		name: "Store",
		iconifyIcon: "streamline:store-2-solid",
		description: "Go to Extension Store",
		function: async () => {
			appState.clearSearchTerm()
			goto("/extension/store")
		}
	},
	{
		name: "Sign In",
		iconifyIcon: "mdi:login-variant",
		description: "",
		function: async () => {
			goto("/auth")
		}
	},
	{
		name: "Sign Out",
		iconifyIcon: "mdi:logout-variant",
		description: "",
		function: async () => {
			auth
				.signOut()
				.then(() => toast.success("Signed out"))
				.catch((err) => toast.error("Failed to sign out: ", { description: err.message }))
		}
	},
	{
		name: "Show Draggable Area",
		iconifyIcon: "mingcute:move-fill",
		description: "",
		function: async () => {
			// select all html elements with attribute data-tauri-drag-region
			const elements = document.querySelectorAll("[data-tauri-drag-region]")
			elements.forEach((el) => {
				el.classList.add("bg-red-500/30")
			})
			setTimeout(() => {
				elements.forEach((el) => {
					el.classList.remove("bg-red-500/30")
				})
			}, 2_000)
		}
	},
	{
		name: "Add Dev Extension",
		iconifyIcon: "lineicons:dev",
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto("/settings/add-dev-extension")
		}
	},
	{
		name: "Kunkun Version",
		iconifyIcon: "stash:version-solid",
		description: "",
		function: async () => {
			toast.success(`Kunkun Version: ${await getVersion()}`)
		}
	},
	{
		name: "Set Dev Extension Path",
		iconifyIcon: "lineicons:dev",
		description: "",
		function: async () => {
			// const appStateStore = useAppStateStore()
			appState.clearSearchTerm()
			goto("/settings/set-dev-ext-path")
		}
	},
	{
		name: "Extension Window Troubleshooter",
		iconifyIcon: "material-symbols:window-outline",
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			// goto("/window-troubleshooter")
			const winLabel = `main:extension-window-troubleshooter-${uuidv4()}`
			console.log(winLabel)
			new WebviewWindow(winLabel, {
				url: "/troubleshooters/extension-window",
				title: "Extension Window Troubleshooter"
			})
		}
	},
	{
		name: "Extension Permission Inspector",
		iconifyIcon: "hugeicons:inspect-code",
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto("/extension/permission-inspector")
		}
	},
	{
		name: "Extension Loading Troubleshooter",
		iconifyIcon: "material-symbols:troubleshoot",
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto("/troubleshooters/extension-loading")
		}
	},
	{
		name: "Create Quicklink",
		iconifyIcon: "material-symbols:link",
		description: "Create a Quicklink",
		function: async () => {
			appState.clearSearchTerm()
			goto("/extension/create-quick-link")
		}
	},
	// {
	// 	name: "Settings",
	// 	iconifyIcon: "solar:settings-linear",
	// 	description: "Open Settings",
	// 	function: async () => {
	// 		const windows = await getAllWebviewWindows()
	// 		const found = windows.find((w) => w.label === SettingsWindowLabel)
	// 		if (found) {
	// 			ElNotification.error("Settings Page is already open")
	// 		} else {
	// 			const win = await newSettingsPage()
	// 			setTimeout(() => {
	// 				// this is a backup, if window is not properly loaded,
	// 				// the show() will not be called within setting page, we call it here with a larger delay,
	// 				// at least the window will be shown
	// 				win.show()
	// 			}, 800)
	// 		}
	// 		const appStateStore = useAppStateStore()
	// 		appStateStore.setSearchTermSync("")
	// 	}
	// },
	{
		name: "Check Update",
		iconifyIcon: "material-symbols:update",
		description: "Check for updates",
		function: async () => {
			checkUpdateAndInstall()
			appState.clearSearchTerm()
		}
	},
	{
		name: "Check Beta Update",
		iconifyIcon: "material-symbols:update",
		description: "Check for Beta updates",
		function: async () => {
			checkUpdateAndInstall({ beta: true })
			appState.clearSearchTerm()
		}
	},
	{
		name: "Reload",
		iconifyIcon: "tabler:reload",
		description: "Reload this page",
		function: async () => {
			location.reload()
		}
	},
	{
		name: "Dance",
		iconifyIcon: "mdi:dance-pole",
		description: "Dance",
		function: async () => {
			goto("/dance")
		}
	},
	{
		name: "Quit Kunkun",
		iconifyIcon: "emojione:cross-mark-button",
		description: "Quit Kunkun",
		function: async () => {
			exit(0)
		}
	},
	{
		name: "Toggle Dev Extension HMR",
		iconifyIcon: "ri:toggle-line",
		description: "Load dev extensions from their dev server URLs",
		function: async () => {
			appConfig.update((config) => {
				toast.success(`Dev Extension HMR toggled to: ${!config.hmr}`)
				return {
					...config,
					hmr: !config.hmr
				}
			})
			appState.clearSearchTerm()
		}
	},
	{
		name: "Toggle Hide On Blur",
		iconifyIcon: "ri:toggle-line",
		description: "Toggle Hide On Blur",
		function: async () => {
			appConfig.update((config) => {
				toast.success(`"Hide on Blur" toggled to: ${!config.hideOnBlur}`)
				return {
					...config,
					hideOnBlur: !config.hideOnBlur
				}
			})
			appState.clearSearchTerm()
		}
	}
]
