import { emitRefreshDevExt } from "@/utils/tauri-events"
import {
	DEEP_LINK_PATH_AUTH_CONFIRM,
	DEEP_LINK_PATH_OPEN,
	DEEP_LINK_PATH_REFRESH_DEV_EXTENSION,
	DEEP_LINK_PATH_STORE
} from "@kksh/api"
import type { UnlistenFn } from "@tauri-apps/api/event"
import { extname } from "@tauri-apps/api/path"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import * as deepLink from "@tauri-apps/plugin-deep-link"
import { error, info } from "@tauri-apps/plugin-log"
import { goto } from "$app/navigation"
import { toast } from "svelte-sonner"
import * as v from "valibot"
import { isInMainWindow } from "./window"

const StorePathSearchParams = v.object({
	identifier: v.optional(v.string())
})

export function initDeeplink(): Promise<UnlistenFn> {
	info("init deeplink")
	if (!isInMainWindow()) {
		return Promise.resolve(() => {})
	}
	// deepLink.getCurrent()
	return deepLink.onOpenUrl((urls) => {
		console.log("deep link:", urls)
		urls.forEach(handleDeepLink)
	})
}

/**
 * Show and focus on the main window
 */
function openMainWindow() {
	const appWindow = getCurrentWebviewWindow()
	return appWindow
		.show()
		.then(() => appWindow.setFocus())
		.catch((err) => {
			console.error(err)
			error(`Failed to show window upon deep link: ${err.message}`)
			toast.error("Failed to show window upon deep link", {
				description: err.message
			})
		})
}

export async function handleKunkunProtocol(parsedUrl: URL) {
	const params = Object.fromEntries(parsedUrl.searchParams)
	const { host, pathname, href } = parsedUrl
	if (href.startsWith(DEEP_LINK_PATH_OPEN)) {
		openMainWindow()
	} else if (href.startsWith(DEEP_LINK_PATH_STORE)) {
		const parsed = v.parse(StorePathSearchParams, params)
		openMainWindow()
		if (parsed.identifier) {
			goto(`/extension/store/${parsed.identifier}`)
		} else {
			goto("/app/extension/store")
		}
	} else if (href.startsWith(DEEP_LINK_PATH_REFRESH_DEV_EXTENSION)) {
		emitRefreshDevExt()
	} else if (href.startsWith(DEEP_LINK_PATH_AUTH_CONFIRM)) {
		openMainWindow()
		goto(`/auth/confirm?${parsedUrl.searchParams.toString()}`)
	} else {
		console.error("Invalid path:", pathname)
		toast.error("Invalid path", {
			description: parsedUrl.href
		})
	}
}

export async function handleFileProtocol(parsedUrl: URL) {
	console.log("File protocol:", parsedUrl)
	const filePath = parsedUrl.pathname // Remove the leading '//' kunkun://open?identifier=qrcode gives "open"
	console.log("File path:", filePath)
	// from file absolute path, get file extension
	const fileExt = await extname(filePath)
	console.log("File extension:", fileExt)
	switch (fileExt) {
		case "kunkun":
			// TODO: Handle file protocol, install extension from file (essentially a .tgz file)
			break
		default:
			console.error("Unknown file extension:", fileExt)
			toast.error("Unknown file extension", {
				description: fileExt
			})
			break
	}
}

/**
 *
 * @param url Deep Link URl, e.g. kunkun://open
 */
export async function handleDeepLink(url: string) {
	const parsedUrl = new URL(url)
	switch (parsedUrl.protocol) {
		case "kunkun:":
			return handleKunkunProtocol(parsedUrl)
		case "file:":
			return handleFileProtocol(parsedUrl)
		default:
			console.error("Invalid Protocol:", parsedUrl.protocol)
			toast.error("Invalid Protocol", {
				description: parsedUrl.protocol
			})
			break
	}
}
