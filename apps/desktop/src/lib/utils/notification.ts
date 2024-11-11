// import { notification } from "@kksh/api/ui"
import * as notification from "@tauri-apps/plugin-notification"

export async function getNotificationPermission() {
	let permissionGranted = await notification.isPermissionGranted()

	// If not we need to request it
	if (!permissionGranted) {
		const permission = await notification.requestPermission()
		permissionGranted = permission === "granted"
	}
	return permissionGranted
}

export async function sendNotificationWithPermission(title: string, body: string) {
	const notificationGranted = await getNotificationPermission()
	if (notificationGranted) {
		notification.sendNotification({ title, body })
	}
}
