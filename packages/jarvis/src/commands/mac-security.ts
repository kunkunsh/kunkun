import { invoke } from "@tauri-apps/api/core"
import { generateJarvisPluginCommand } from "./common"

export function verifyAuth(): Promise<boolean> {
	return invoke(generateJarvisPluginCommand("verify_auth"))
}

export function requestScreenCaptureAccess(): Promise<boolean> {
	return invoke(generateJarvisPluginCommand("request_screen_capture_access"))
}

export function checkScreenCaptureAccess(): Promise<boolean> {
	return invoke(generateJarvisPluginCommand("check_screen_capture_access"))
}
