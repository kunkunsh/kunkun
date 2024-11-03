import type { WindowConfig } from "@kksh/api/models"
import { WebviewWindow } from "@tauri-apps/api/webviewWindow"

export function launchNewExtWindow(windowLabel: string, url: string, windowConfig?: WindowConfig) {
	return new WebviewWindow(windowLabel, {
		center: windowConfig?.center ?? undefined,
		x: windowConfig?.x ?? undefined,
		y: windowConfig?.y ?? undefined,
		width: windowConfig?.width ?? undefined,
		height: windowConfig?.height ?? undefined,
		minWidth: windowConfig?.minWidth ?? undefined,
		minHeight: windowConfig?.minHeight ?? undefined,
		maxWidth: windowConfig?.maxWidth ?? undefined,
		maxHeight: windowConfig?.maxHeight ?? undefined,
		resizable: windowConfig?.resizable ?? undefined,
		title: windowConfig?.title ?? undefined,
		fullscreen: windowConfig?.fullscreen ?? undefined,
		focus: windowConfig?.focus ?? undefined,
		transparent: windowConfig?.transparent ?? undefined,
		maximized: windowConfig?.maximized ?? undefined,
		visible: windowConfig?.visible ?? false, // default to false to avoid flickering
		decorations: windowConfig?.decorations ?? undefined,
		alwaysOnTop: windowConfig?.alwaysOnTop ?? undefined,
		alwaysOnBottom: windowConfig?.alwaysOnBottom ?? undefined,
		contentProtected: windowConfig?.contentProtected ?? undefined,
		skipTaskbar: windowConfig?.skipTaskbar ?? undefined,
		shadow: windowConfig?.shadow ?? undefined,
		// theme: windowConfig?.theme ?? undefined,
		titleBarStyle: windowConfig?.titleBarStyle ?? undefined,
		hiddenTitle: windowConfig?.hiddenTitle ?? undefined,
		tabbingIdentifier: windowConfig?.tabbingIdentifier ?? undefined,
		maximizable: windowConfig?.maximizable ?? undefined,
		minimizable: windowConfig?.minimizable ?? undefined,
		closable: windowConfig?.closable ?? undefined,
		parent: windowConfig?.parent ?? undefined,
		visibleOnAllWorkspaces: windowConfig?.visibleOnAllWorkspaces ?? undefined,
		url
	})
}
