import { i18n } from "@/i18n"
import { appState } from "@/stores"
import { winExtMap } from "@/stores/winExtMap"
import { helperAPI } from "@/utils/helper"
import { paste } from "@/utils/hotkey"
import { decideKkrpcSerialization } from "@/utils/kkrpc"
import { sleep } from "@/utils/time"
import { trimSlash } from "@/utils/url"
import { constructExtensionSupportDir } from "@kksh/api"
import { spawnExtensionFileServer } from "@kksh/api/commands"
import type { HeadlessCommand } from "@kksh/api/headless"
import { CustomUiCmd, ExtPackageJsonExtra, HeadlessCmd, TemplateUiCmd } from "@kksh/api/models"
import { constructJarvisServerAPIWithPermissions, type IApp } from "@kksh/api/ui"
import { db } from "@kksh/drizzle"
import { launchNewExtWindow, loadExtensionManifestFromDisk } from "@kksh/extension"
import type { IKunkunFullServerAPI } from "@kunkunapi/src/api/server"
import { convertFileSrc } from "@tauri-apps/api/core"
import * as path from "@tauri-apps/api/path"
import { getCurrentWindow } from "@tauri-apps/api/window"
import * as fs from "@tauri-apps/plugin-fs"
import { info } from "@tauri-apps/plugin-log"
import { platform } from "@tauri-apps/plugin-os"
import { goto } from "$app/navigation"
import { RPCChannel, WorkerParentIO } from "kkrpc/browser"
import * as v from "valibot"

export const KunkunIframeExtParams = v.object({
	url: v.string(),
	cmdName: v.optional(v.string()),
	extPath: v.string()
})
export type KunkunIframeExtParams = v.InferOutput<typeof KunkunIframeExtParams>
export const KunkunTemplateExtParams = v.object({
	url: v.optional(v.string()),
	extPath: v.string(),
	cmdName: v.string()
})
export type KunkunTemplateExtParams = v.InferOutput<typeof KunkunTemplateExtParams>

export async function createExtSupportDir(extPath: string) {
	const extSupportDir = await constructExtensionSupportDir(extPath)
	if (!(await fs.exists(extSupportDir))) {
		await fs.mkdir(extSupportDir, { recursive: true })
	}
}

function setTemplateExtParams(extPath: string, cmdName: string, url?: string) {
	localStorage.setItem(
		"kunkun-template-ext-params",
		JSON.stringify({ extPath, cmdName, url } satisfies KunkunTemplateExtParams)
	)
}

export async function onTemplateUiCmdSelect(
	ext: ExtPackageJsonExtra,
	cmd: TemplateUiCmd,
	{ isDev, hmr }: { isDev: boolean; hmr: boolean }
) {
	await createExtSupportDir(ext.extPath)
	const url = `/app/extension/ui-worker?extPath=${encodeURIComponent(ext.extPath)}&cmdName=${encodeURIComponent(cmd.name)}`
	setTemplateExtParams(ext.extPath, cmd.name, url)
	if (cmd.window) {
		const winLabel = await winExtMap.registerExtensionWithWindow({ extPath: ext.extPath })
		const paramsStr = JSON.stringify({
			url,
			extPath: ext.extPath,
			cmdName: cmd.name
		} satisfies KunkunIframeExtParams)
		localStorage.setItem("kunkun-template-ext-params", paramsStr)
		const window = launchNewExtWindow(winLabel, url, cmd.window)
		window.onCloseRequested(async (event) => {
			await winExtMap.unregisterExtensionFromWindow(winLabel)
		})
	} else {
		return winExtMap
			.registerExtensionWithWindow({ windowLabel: "main", extPath: ext.extPath })
			.then(() => goto(i18n.resolveRoute(url)))
	}
}

export async function onHeadlessCmdSelect(
	ext: ExtPackageJsonExtra,
	cmd: HeadlessCmd,
	{ isDev, hmr }: { isDev: boolean; hmr: boolean }
) {
	await createExtSupportDir(ext.extPath)
	// load the script in Web Worker
	const loadedExt = await loadExtensionManifestFromDisk(
		await path.join(ext.extPath, "package.json")
	)

	const scriptPath = await path.join(loadedExt.extPath, cmd.main)
	const workerScript = await fs.readTextFile(scriptPath)
	const blob = new Blob([workerScript], { type: "application/javascript" })
	const blobURL = URL.createObjectURL(blob)
	const worker = new Worker(blobURL)
	const extInfoInDB = await db.getUniqueExtensionByPath(loadedExt.extPath)
	if (!extInfoInDB) {
		return
	}
	const serverAPI: IKunkunFullServerAPI = constructJarvisServerAPIWithPermissions(
		loadedExt.kunkun.permissions,
		loadedExt.extPath,
		{
			recordSpawnedProcess: async (pid: number) => {
				console.log("recordSpawnedProcess pid", pid)
			},
			getSpawnedProcesses: async () => {
				console.log("getSpawnedProcesses")
				return []
			},
			paste: async () => {
				await getCurrentWindow().hide()
				await sleep(200)
				return paste()
			}
		}
	)
	const serverAPI2 = {
		...serverAPI,
		iframeUi: undefined,
		helper: helperAPI,
		workerUi: undefined,
		db: new db.JarvisExtDB(extInfoInDB.extId),
		kv: new db.KV(extInfoInDB.extId),
		app: {
			language: () => Promise.resolve("en")
		} satisfies IApp
	}
	const io = new WorkerParentIO(worker)
	const kkrpcSerialization = decideKkrpcSerialization(loadedExt)
	info(
		`Establishing kkrpc connection for ${loadedExt.kunkun.identifier} with serialization: ${kkrpcSerialization}`
	)
	const rpc = new RPCChannel<typeof serverAPI2, HeadlessCommand>(io, {
		expose: serverAPI2,
		serialization: {
			version: kkrpcSerialization
		}
	})
	const workerAPI = rpc.getAPI()
	await workerAPI.load()
}

function setIframeExtParams(extPath: string, url: string) {
	localStorage.setItem(
		"kunkun-iframe-ext-params",
		JSON.stringify({ url, extPath } satisfies KunkunIframeExtParams)
	)
}

export async function onCustomUiCmdSelect(
	ext: ExtPackageJsonExtra,
	cmd: CustomUiCmd,
	{ isDev, hmr }: { isDev: boolean; hmr: boolean }
) {
	// console.log("onCustomUiCmdSelect", ext, cmd, isDev, hmr)
	await createExtSupportDir(ext.extPath)
	let url = cmd.main
	const useDevMain = hmr && isDev && cmd.devMain
	if (useDevMain) {
		url = cmd.devMain
	} else {
		url = cmd.main.startsWith("http")
			? cmd.main
			: decodeURIComponent(convertFileSrc(`${trimSlash(cmd.main)}`, "ext"))
	}
	let url2 = `/app/extension/ui-iframe?url=${encodeURIComponent(url)}&extPath=${encodeURIComponent(ext.extPath)}`
	// url2 = `/dev?url=${encodeURIComponent(url)}&extPath=${encodeURIComponent(ext.extPath)}`

	setIframeExtParams(ext.extPath, url)
	if (cmd.window) {
		const winLabel = await winExtMap.registerExtensionWithWindow({
			extPath: ext.extPath,
			dist: cmd.dist
		})
		if (platform() === "windows" && !useDevMain) {
			const addr = await spawnExtensionFileServer(winLabel)
			const newUrl = `http://${addr}`
			url2 = `/app/extension/ui-iframe?url=${encodeURIComponent(newUrl)}&extPath=${encodeURIComponent(ext.extPath)}`
			setIframeExtParams(ext.extPath, newUrl)
		}
		localStorage.setItem(
			"kunkun-iframe-ext-params",
			JSON.stringify({ url, extPath: ext.extPath } satisfies KunkunIframeExtParams)
		)
		const window = launchNewExtWindow(winLabel, url2, cmd.window)
		window.onCloseRequested(async (event) => {
			await winExtMap.unregisterExtensionFromWindow(winLabel)
		})
	} else {
		console.log("Launch main window")
		const winLabel = await winExtMap.registerExtensionWithWindow({
			windowLabel: "main",
			extPath: ext.extPath,
			dist: cmd.dist
		})
		const _platform = platform()
		if ((_platform === "windows" || _platform === "linux") && !useDevMain) {
			const addr = await spawnExtensionFileServer(winLabel) // addr has format "127.0.0.1:<port>"
			console.log("Extension file server address: ", addr)
			const newUrl = `http://${addr}`
			url2 = `/app/extension/ui-iframe?url=${encodeURIComponent(newUrl)}&extPath=${encodeURIComponent(ext.extPath)}`
			setIframeExtParams(ext.extPath, newUrl)
		}
		goto(i18n.resolveRoute(url2))
	}
	appState.clearSearchTerm()
}

export async function onRaycastCmdSelect(
	ext: ExtPackageJsonExtra,
	cmd: CustomUiCmd,
	{ isDev, hmr }: { isDev: boolean; hmr: boolean }
) {
	// console.log("onCustomUiCmdSelect", ext, cmd, isDev, hmr)
	await createExtSupportDir(ext.extPath)
	let url = cmd.main
	const useDevMain = hmr && isDev && cmd.devMain
	if (useDevMain) {
		url = cmd.devMain
	} else {
		url = cmd.main.startsWith("http")
			? cmd.main
			: decodeURIComponent(convertFileSrc(`${trimSlash(cmd.main)}`, "ext"))
	}
	let url2 = `/app/extension/raycast?url=${encodeURIComponent(url)}&extPath=${encodeURIComponent(ext.extPath)}`
	// url2 = `/dev?url=${encodeURIComponent(url)}&extPath=${encodeURIComponent(ext.extPath)}`

	setIframeExtParams(ext.extPath, url)
	if (cmd.window) {
		const winLabel = await winExtMap.registerExtensionWithWindow({
			extPath: ext.extPath,
			dist: cmd.dist
		})
		if (platform() === "windows" && !useDevMain) {
			const addr = await spawnExtensionFileServer(winLabel)
			const newUrl = `http://${addr}`
			url2 = `/app/extension/raycast?url=${encodeURIComponent(newUrl)}&extPath=${encodeURIComponent(ext.extPath)}`
			setIframeExtParams(ext.extPath, newUrl)
		}
		localStorage.setItem(
			"kunkun-iframe-ext-params",
			JSON.stringify({ url, extPath: ext.extPath } satisfies KunkunIframeExtParams)
		)
		const window = launchNewExtWindow(winLabel, url2, cmd.window)
		window.onCloseRequested(async (event) => {
			await winExtMap.unregisterExtensionFromWindow(winLabel)
		})
	} else {
		console.log("Launch main window")
		const winLabel = await winExtMap.registerExtensionWithWindow({
			windowLabel: "main",
			extPath: ext.extPath,
			dist: cmd.dist
		})
		const _platform = platform()
		if ((_platform === "windows" || _platform === "linux") && !useDevMain) {
			const addr = await spawnExtensionFileServer(winLabel) // addr has format "127.0.0.1:<port>"
			console.log("Extension file server address: ", addr)
			const newUrl = `http://${addr}`
			url2 = `/app/extension/raycast?url=${encodeURIComponent(newUrl)}&extPath=${encodeURIComponent(ext.extPath)}`
			setIframeExtParams(ext.extPath, newUrl)
		}
		goto(i18n.resolveRoute(url2))
	}
	appState.clearSearchTerm()
}
