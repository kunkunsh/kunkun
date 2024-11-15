/**
 * Store in this file is used to map window labels to extension paths and pids
 * The purpose is to keep track of which extensions are running in which windows, and the left over processes when the extension is closed
 */
import { killProcesses } from "@/utils/process"
import {
	getExtLabelMap,
	registerExtensionSpawnedProcess,
	registerExtensionWindow,
	unregisterExtensionSpawnedProcess,
	unregisterExtensionWindow
} from "@kksh/api/commands"
import { debug, warn } from "@tauri-apps/plugin-log"
import { get, writable, type Writable } from "svelte/store"

export type WinExtMap = Record<
	string,
	{
		windowLabel: string
		extPath: string
		pids: number[]
	}
>

type API = {
	init: () => Promise<void>
	registerExtensionWithWindow: (options: {
		windowLabel?: string
		extPath: string
		dist?: string
	}) => Promise<string>
	unregisterExtensionFromWindow: (windowLabel: string) => Promise<void>
	cleanupProcessesFromWindow: (windowLabel: string) => Promise<void>
	registerProcess: (windowLabel: string, pid: number) => Promise<void>
	unregisterProcess: (pid: number) => Promise<void>
}

function createWinExtMapStore(): Writable<WinExtMap> & API {
	const store = writable<WinExtMap>({})

	async function init() {}

	return {
		...store,
		init,
		registerExtensionWithWindow: async ({
			extPath,
			windowLabel,
			dist
		}: {
			extPath: string
			windowLabel?: string
			dist?: string
		}) => {
			const winExtMap = get(store)
			if (windowLabel) {
				if (winExtMap[windowLabel]) {
					// there is a previous extension registered in this window but not cleaned up properly
					warn(`Window ${windowLabel} has a previous extension registered but not cleaned up`)
					await killProcesses(winExtMap[windowLabel].pids)
					delete winExtMap[windowLabel]
				} else {
					// winExtMap[windowLabel] = {
					// 	windowLabel,
					// 	extPath,
					// 	pids: []
					// }
				}
			}
			const returnedWinLabel = await registerExtensionWindow({
				extensionPath: extPath,
				windowLabel,
				dist
			})
			winExtMap[returnedWinLabel] = {
				windowLabel: returnedWinLabel,
				extPath,
				pids: []
			}
			store.set(winExtMap)
			return returnedWinLabel
		},
		unregisterExtensionFromWindow: async (windowLabel: string) => {
			const winExtMap = get(store)
			if (winExtMap[windowLabel]) {
				// clean up processes spawned by extension but not killed by itself
				const extLabelMap = await getExtLabelMap() // realtime data from core process
				if (extLabelMap[windowLabel]) {
					console.log("kill processes", extLabelMap[windowLabel].processes)
					killProcesses(extLabelMap[windowLabel].processes)
				}
				await unregisterExtensionWindow(windowLabel)
				delete winExtMap[windowLabel]
				store.set(winExtMap)
			} else {
				warn(`Window ${windowLabel} does not have an extension registered`)
			}
		},
		cleanupProcessesFromWindow: async (windowLabel: string) => {
			const winExtMap = get(store)
			if (winExtMap[windowLabel]) {
				debug(`Cleaning up processes from window ${windowLabel}: ${winExtMap[windowLabel].pids}`)
				await killProcesses(winExtMap[windowLabel].pids)
			}
		},
		registerProcess: async (windowLabel: string, pid: number) => {
			const winExtMap = get(store)
			await registerExtensionSpawnedProcess(windowLabel, pid)
			if (!winExtMap[windowLabel]) {
				throw new Error(`Window ${windowLabel} does not have an extension registered`)
			}
			winExtMap[windowLabel].pids.push(pid)
			store.set(winExtMap)
		},
		unregisterProcess: async (pid: number) => {
			const winExtMap = get(store)
			const found = Object.entries(winExtMap).find(([windowLabel, ext]) => ext.pids.includes(pid))
			if (!found) {
				return
			}
			const [windowLabel, ext] = found
			return unregisterExtensionSpawnedProcess(windowLabel, pid).then(() => {
				ext.pids = ext.pids.filter((p) => p !== pid)
			})
		}
	}
}

export const winExtMap = createWinExtMapStore()
