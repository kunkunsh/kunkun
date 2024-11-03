import { error } from "@tauri-apps/plugin-log"
import { Child } from "tauri-plugin-shellx-api"

export function killProcesses(pids: number[]) {
	return Promise.all(
		pids.map((pid) => {
			return new Child(pid).kill().catch((err) => {
				error(`Failed to kill process ${pid}, ${err}`)
				console.error(`Failed to kill process ${pid}`, err)
			})
		})
	)
}
