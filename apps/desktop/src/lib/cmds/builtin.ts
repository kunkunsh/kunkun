import { appConfig, appState, auth } from "@/stores"
import { checkUpdateAndInstall } from "@/utils/updater"
import type { BuiltinCmd } from "@kksh/ui/types"
import { getVersion } from "@tauri-apps/api/app"
import { WebviewWindow } from "@tauri-apps/api/webviewWindow"
import { exit } from "@tauri-apps/plugin-process"
import { dev } from "$app/environment"
import { goto } from "$app/navigation"
import { toast } from "svelte-sonner"
import { derived } from "svelte/store"
import * as clipboard from "tauri-plugin-clipboard-api"
import { v4 as uuidv4 } from "uuid"

export const rawBuiltinCmds: BuiltinCmd[] = [
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
		},
		keywords: ["extension", "window", "troubleshooter"]
	},
	{
		name: "Extension Permission Inspector",
		iconifyIcon: "hugeicons:inspect-code",
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto("/extension/permission-inspector")
		},
		keywords: ["extension"]
	},
	{
		name: "Extension Loading Troubleshooter",
		iconifyIcon: "material-symbols:troubleshoot",
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto("/troubleshooters/extension-loading")
		},
		keywords: ["extension", "troubleshooter"]
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
	{
		name: "Settings",
		iconifyIcon: "solar:settings-linear",
		description: "Open Settings",
		function: async () => {
			goto("/settings")
			appState.clearSearchTerm()
		}
	},
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
		name: "Pin Current Screenshot",
		iconifyIcon: "material-symbols:screenshot-monitor-outline",
		description: "Pin the current screenshot",
		function: async () => {
			appState.clearSearchTerm()
			if (!(await clipboard.hasImage())) {
				toast.error("No screenshot in clipboard")
				return
			}
			const window = new WebviewWindow(`main:pinned-screenshot-${uuidv4()}`, {
				url: "/extension/pin-screenshot",
				title: "Pinned Screenshot",
				hiddenTitle: true,
				titleBarStyle: "transparent",
				decorations: false,
				visible: false
			})
			setTimeout(() => {
				window.show()
			}, 2_000)
		}
	},
	{
		name: "MDNS Debugger",
		iconifyIcon: "material-symbols:wifi-find",
		description: "MDNS Debugger",
		function: async () => {
			goto("/troubleshooters/mdns-debugger")
		},
		flags: {
			developer: true
		},
		keywords: ["mdns", "debugger", "troubleshooter"]
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
	},
	{
		name: "Toggle Developer Mode",
		iconifyIcon: "hugeicons:developer",
		description: "Toggle Developer Mode",
		function: async () => {
			appConfig.update((config) => {
				toast.success(`Developer Mode toggled to: ${!config.developerMode}`)
				return { ...config, developerMode: !config.developerMode }
			})
		}
	}
].map((cmd) => ({ ...cmd, id: uuidv4() }))

export const builtinCmds = derived(appConfig, ($appConfig) => {
	return rawBuiltinCmds.filter((cmd) => {
		const passDeveloper = cmd.flags?.developer ? $appConfig.developerMode : true
		const passDev = cmd.flags?.dev ? dev : true
		return passDeveloper && passDev
	})
})
