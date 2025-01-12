import { appState } from "@/stores"
import { winExtMap } from "@/stores/winExtMap"
import { trimSlash } from "@/utils/url"
import { constructExtensionSupportDir } from "@kksh/api"
import { db, spawnExtensionFileServer } from "@kksh/api/commands"
import { HeadlessWorkerExtension } from "@kksh/api/headless"
import { CustomUiCmd, ExtPackageJsonExtra, HeadlessCmd, TemplateUiCmd } from "@kksh/api/models"
import { constructJarvisServerAPIWithPermissions, type IApp } from "@kksh/api/ui"
import { launchNewExtWindow, loadExtensionManifestFromDisk } from "@kksh/extension"
import { convertFileSrc } from "@tauri-apps/api/core"
import * as path from "@tauri-apps/api/path"
import * as fs from "@tauri-apps/plugin-fs"
import { platform } from "@tauri-apps/plugin-os"
import { goto } from "$app/navigation"
import { RPCChannel, WorkerParentIO } from "kkrpc/browser"

export async function createExtSupportDir(extPath: string) {
	const extSupportDir = await constructExtensionSupportDir(extPath)
	if (!(await fs.exists(extSupportDir))) {
		await fs.mkdir(extSupportDir, { recursive: true })
	}
}

export async function onTemplateUiCmdSelect(
	ext: ExtPackageJsonExtra,
	cmd: TemplateUiCmd,
	{ isDev, hmr }: { isDev: boolean; hmr: boolean }
) {
	await createExtSupportDir(ext.extPath)
	// console.log("onTemplateUiCmdSelect", ext, cmd, isDev, hmr)
	const url = `/app/extension/ui-worker?extPath=${encodeURIComponent(ext.extPath)}&cmdName=${encodeURIComponent(cmd.name)}`
	if (cmd.window) {
		const winLabel = await winExtMap.registerExtensionWithWindow({ extPath: ext.extPath })
		const window = launchNewExtWindow(winLabel, url, cmd.window)
		window.onCloseRequested(async (event) => {
			await winExtMap.unregisterExtensionFromWindow(winLabel)
		})
	} else {
		return winExtMap
			.registerExtensionWithWindow({ windowLabel: "main", extPath: ext.extPath })
			.then(() => goto(url))
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
	const serverAPI: Record<string, any> = constructJarvisServerAPIWithPermissions(
		loadedExt.kunkun.permissions,
		loadedExt.extPath
	)
	serverAPI.iframeUi = undefined
	serverAPI.workerUi = undefined
	serverAPI.db = new db.JarvisExtDB(extInfoInDB.extId)
	serverAPI.kv = new db.KV(extInfoInDB.extId)
	serverAPI.app = {
		language: () => Promise.resolve("en")
	} satisfies IApp
	const io = new WorkerParentIO(worker)
	const rpc = new RPCChannel<typeof serverAPI, HeadlessWorkerExtension>(io, {
		expose: serverAPI
	})
	const workerAPI = rpc.getAPI()
	await workerAPI.load()
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
	if (cmd.window) {
		const winLabel = await winExtMap.registerExtensionWithWindow({
			extPath: ext.extPath,
			dist: cmd.dist
		})
		if (platform() === "windows" && !useDevMain) {
			const addr = await spawnExtensionFileServer(winLabel)
			const newUrl = `http://${addr}`
			url2 = `/app/extension/ui-iframe?url=${encodeURIComponent(newUrl)}&extPath=${encodeURIComponent(ext.extPath)}`
		}
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
		if (platform() === "windows" && !useDevMain) {
			const addr = await spawnExtensionFileServer(winLabel) // addr has format "127.0.0.1:<port>"
			console.log("Extension file server address: ", addr)
			const newUrl = `http://${addr}`
			url2 = `/app/extension/ui-iframe?url=${encodeURIComponent(newUrl)}&extPath=${encodeURIComponent(ext.extPath)}`
		}
		goto(url2)
	}
	appState.clearSearchTerm()
}
