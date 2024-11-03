import { invoke } from "@tauri-apps/api/core"
import { array, literal, number, object, parse, string, union, type InferOutput } from "valibot"
import { generateJarvisPluginCommand } from "./common"

export const ClipboardContentType = union([
	literal("Text"),
	literal("Image"),
	literal("Html"),
	literal("Rtf")
	// z.literal("File"),
])
export type ClipboardContentType = InferOutput<typeof ClipboardContentType>
export const ClipboardRecord = object({
	value: string(),
	contentType: ClipboardContentType,
	timestamp: number(),
	text: string()
})
export type ClipboardRecord = InferOutput<typeof ClipboardRecord>
export const ClipboardRecords = array(ClipboardRecord)
export type ClipboardRecords = InferOutput<typeof ClipboardRecords>

export function addClipboardHistory(value: string) {
	return invoke<null>(generateJarvisPluginCommand("add_to_history"), { value })
}

export function getClipboardHistory() {
	return invoke<ClipboardRecord[]>(generateJarvisPluginCommand("get_history")).then((records) => {
		return parse(ClipboardRecords, records)
	})
}

// export function setCandidateFilesForServer(files: string[]) {
//   return invoke<null>(generateJarvisPluginCommand("set_candidate_files"), { files })
// }
