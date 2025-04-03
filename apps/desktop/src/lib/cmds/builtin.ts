import { i18n } from "@/i18n"
import { appConfig, appState, auth, extensions } from "@/stores"
import { checkUpdateAndInstall } from "@/utils/updater"
import { setTransparentTitlebar } from "@kksh/api/commands"
import { IconEnum } from "@kksh/api/models"
import type { BuiltinCmd } from "@kksh/ui/types"
import { commandScore } from "@kksh/ui/utils"
import { getVersion } from "@tauri-apps/api/app"
import { appDataDir } from "@tauri-apps/api/path"
import { WebviewWindow } from "@tauri-apps/api/webviewWindow"
import { exit } from "@tauri-apps/plugin-process"
import { dev } from "$app/environment"
import { goto } from "$app/navigation"
import Fuse from "fuse.js"
import { toast } from "svelte-sonner"
import { derived } from "svelte/store"
import * as clipboard from "tauri-plugin-clipboard-api"
import { open } from "tauri-plugin-shellx-api"
import { v4 as uuidv4 } from "uuid"

export const rawBuiltinCmds: BuiltinCmd[] = [
	{
		name: "Store",
		icon: {
			type: IconEnum.Iconify,
			value: "streamline:store-2-solid"
		},
		description: "Go to Extension Store",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/extension/store"))
		}
	},
	{
		name: "Sign In",
		icon: {
			type: IconEnum.Iconify,
			value: "mdi:login-variant"
		},
		description: "",
		function: async () => {
			goto(i18n.resolveRoute("/app/auth"))
		}
	},
	{
		name: "Sign Out",
		icon: {
			type: IconEnum.Iconify,
			value: "mdi:logout-variant"
		},
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
		icon: {
			type: IconEnum.Iconify,
			value: "mingcute:move-fill"
		},
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
		name: "Splashscreen (Dev)",
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:skeleton"
		},
		description: "",
		flags: {
			dev: true
		},
		function: async () => {
			new WebviewWindow(`splashscreen`, {
				url: "/splashscreen"
			})
			appState.clearSearchTerm()
		}
	},
	{
		name: "File Transfer",
		icon: {
			type: IconEnum.Iconify,
			value: "clarity:file-share-solid"
		},
		description: "",
		function: async () => {
			goto(i18n.resolveRoute("/app/extension/file-transfer"))
			appState.clearSearchTerm()
		}
	},
	{
		name: "Add Dev Extension",
		icon: {
			type: IconEnum.Iconify,
			value: "lineicons:dev",
			hexColor: "#0f0"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/settings/add-dev-extension"))
		}
	},
	{
		name: "Kunkun Version",
		icon: {
			type: IconEnum.Iconify,
			value: "stash:version-solid"
		},
		description: "",
		function: async () => {
			toast.success(`Kunkun Version: ${await getVersion()}`)
		}
	},
	{
		name: "Set Dev Extension Path",
		icon: {
			type: IconEnum.Iconify,
			value: "lineicons:dev",
			hexColor: "#0f0"
		},
		description: "",
		function: async () => {
			// const appStateStore = useAppStateStore()
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/settings/set-dev-ext-path"))
		}
	},
	{
		name: "Extension Window Troubleshooter",
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:window-outline"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			const winLabel = `main:extension-window-troubleshooter-${uuidv4()}`
			console.log(winLabel)
			new WebviewWindow(winLabel, {
				url: "/app/troubleshooters/extension-window",
				title: "Extension Window Troubleshooter"
			})
		},
		keywords: ["extension", "window", "troubleshooter"]
	},
	{
		name: "Database Troubleshooter",
		icon: {
			type: IconEnum.Iconify,
			value: "devicon:sqlite"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/troubleshooters/database-info"))
		},
		keywords: ["database", "troubleshooter"]
	},
	{
		name: "Help (Install Deno)",
		icon: {
			type: IconEnum.Iconify,
			value: "simple-icons:deno"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/help/deno-install"))
		},
		keywords: ["help", "deno", "install"]
	},
	{
		name: "Help (Install ffmpeg)",
		icon: {
			type: IconEnum.Iconify,
			value: "logos:ffmpeg-icon"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/help/ffmpeg-install"))
		},
		keywords: ["help", "ffmpeg", "install"]
	},
	{
		name: "Help (Install homebrew)",
		icon: {
			type: IconEnum.Iconify,
			value: "devicon:homebrew"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/help/brew-install"))
		},
		keywords: ["help", "brew", "install", "homebrew"]
	},
	{
		name: "On Boarding (Dev Only)",
		icon: {
			type: IconEnum.Iconify,
			value: "fluent-mdl2:onboarding"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/help/onboarding"))
		},
		flags: {
			dev: true,
			developer: true
		}
	},
	{
		name: "Extension Permission Inspector",
		icon: {
			type: IconEnum.Iconify,
			value: "hugeicons:inspect-code"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/extension/permission-inspector"))
		},
		keywords: ["extension"]
	},
	{
		name: "Extension Loading Troubleshooter",
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:troubleshoot"
		},
		description: "",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/troubleshooters/extension-loading"))
		},
		keywords: ["extension", "troubleshooter"]
	},
	{
		name: "ORM Troubleshooter",
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:database"
		},
		description: "",
		flags: {
			developer: true,
			dev: true
		},
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/troubleshooters/orm"))
		},
		keywords: ["extension", "troubleshooter", "database", "orm"]
	},
	{
		name: "Create Quicklink",
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:link"
		},
		description: "Create a Quicklink",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/extension/create-quick-link"))
		}
	},
	{
		name: "Key Displayer",
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:keyboard"
		},
		description: "Display the current key",
		function: async () => {
			appState.clearSearchTerm()
			const label = `main:extension:key-displayer-${uuidv4()}`
			new WebviewWindow(label, {
				url: "/app/extension/key-displayer",
				title: "Key Displayer",
				decorations: false,
				hiddenTitle: true,
				visible: false,
				alwaysOnTop: true,
				width: 200,
				height: 140
			})
			// setTransparentTitlebar(label)
		}
	},
	{
		name: "Settings",
		icon: {
			type: IconEnum.Iconify,
			value: "solar:settings-linear"
		},
		description: "Open Settings",
		function: async () => {
			goto(i18n.resolveRoute("/app/settings"))
			appState.clearSearchTerm()
		}
	},
	{
		name: "Check Update",
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:update"
		},
		description: "Check for updates",
		function: async () => {
			checkUpdateAndInstall()
			appState.clearSearchTerm()
		}
	},
	{
		name: "Check Beta Update",
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:update"
		},
		description: "Check for Beta updates",
		function: async () => {
			checkUpdateAndInstall({ beta: true })
			appState.clearSearchTerm()
		}
	},
	{
		name: "Reload",
		icon: {
			type: IconEnum.Iconify,
			value: "tabler:reload"
		},
		description: "Reload this page",
		function: async () => {
			location.reload()
		}
	},
	{
		name: "Reload Extensions",
		icon: {
			type: IconEnum.Iconify,
			value: "tabler:reload"
		},
		description: "Reload Extensions",
		function: async () => {
			extensions.init().then(() => {
				appState.clearSearchTerm()
			})
		}
	},
	{
		name: "Dance",
		icon: {
			type: IconEnum.Iconify,
			value: "mdi:dance-pole"
		},
		description: "Dance",
		function: async () => {
			goto(i18n.resolveRoute("/app/dance"))
		}
	},
	{
		name: "Quit Kunkun",
		icon: {
			type: IconEnum.Iconify,
			value: "emojione:cross-mark-button"
		},
		description: "Quit Kunkun",
		function: async () => {
			exit(0)
		}
	},
	{
		name: "Toggle Dev Extension HMR",
		icon: {
			type: IconEnum.Iconify,
			value: "ri:toggle-line"
		},
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
		name: "Clipboard History",
		icon: {
			type: IconEnum.Iconify,
			value: "mdi:clipboard-outline"
		},
		description: "Clipboard History",
		function: async () => {
			appState.clearSearchTerm()
			goto(i18n.resolveRoute("/app/extension/clipboard"))
		}
	},
	{
		name: "Pin Current Screenshot",
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:screenshot-monitor-outline"
		},
		description: "Pin the current screenshot",
		function: async () => {
			appState.clearSearchTerm()
			if (!(await clipboard.hasImage())) {
				toast.error("No screenshot in clipboard")
				return
			}
			const window = new WebviewWindow(`main:pinned-screenshot-${uuidv4()}`, {
				url: "/app/extension/pin-screenshot",
				title: "Pinned Screenshot",
				hiddenTitle: true,
				titleBarStyle: "transparent",
				decorations: false,
				visible: false
			})
			setTimeout(() => {
				window.show().then(() => window.setFocus())
			}, 2_000)
		}
	},
	{
		name: "MDNS Debugger",
		icon: {
			type: IconEnum.Iconify,
			value: "material-symbols:wifi-find"
		},
		description: "MDNS Debugger",
		function: async () => {
			goto(i18n.resolveRoute("/app/troubleshooters/mdns-debugger"))
		},
		flags: {
			developer: true
		},
		keywords: ["mdns", "debugger", "troubleshooter"]
	},
	{
		name: "Toggle Hide On Blur",
		icon: {
			type: IconEnum.Iconify,
			value: "ri:toggle-line"
		},
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
		icon: {
			type: IconEnum.Iconify,
			value: "hugeicons:developer"
		},
		description: "Toggle Developer Mode",
		function: async () => {
			appConfig.update((config) => {
				toast.success(`Developer Mode toggled to: ${!config.developerMode}`)
				return { ...config, developerMode: !config.developerMode }
			})
		}
	},
	{
		name: "Open App Data Dir",
		icon: {
			type: IconEnum.Iconify,
			value: "mdi:folder-open"
		},
		description: "Open App Data Dir",
		function: async () => {
			console.log(await appDataDir())
			open(await appDataDir())
		}
	}
].map((cmd) => ({ ...cmd, id: uuidv4() }))

export const fuse = new Fuse<BuiltinCmd>(rawBuiltinCmds, {
	includeScore: true,
	threshold: 0.2,
	keys: ["name"]
})

export const builtinCmds = derived([appConfig, appState], ([$appConfig, $appState]) => {
	return $appState.searchTerm
		? fuse
				.search($appState.searchTerm)
				.map((result) => result.item)
				.filter(
					(cmd) => (!cmd.flags?.developer || $appConfig.developerMode) && (!cmd.flags?.dev || dev)
				)
		: rawBuiltinCmds
})
