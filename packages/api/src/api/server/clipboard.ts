import { constructClipboardApi as _constructClipboardApi } from "tauri-api-adapter"
import { type ClipboardPermission as _ClipboardPermission } from "tauri-api-adapter/permissions"
import type { ClipboardPermission } from "../../permissions/permission-map"
import type { IClipboard } from "../client"

export function constructClipboardApi(
	permissions: ClipboardPermission[],
	paste: (options?: {}) => Promise<void>
): IClipboard {
	return {
		..._constructClipboardApi(permissions.filter((p) => p !== "clipboard:paste")), // this constructor has no paste API
		paste
	}
}
