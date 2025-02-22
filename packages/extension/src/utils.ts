import { invoke } from "@tauri-apps/api/core";

/**
 * Check if the extension path is in dev mode
 * @param extPath - The main extension path
 * @param candidateExtPath - The candidate extension path
 * @returns True if the extension path is in dev mode, false otherwise
 */
export function isExtPathInDev(extPath: string, candidateExtPath: string) {
	return !candidateExtPath.startsWith(extPath)
}

/**
 * Copy directory from one location to another in tauri backend
 * 
 * Needed as Linux cannot rename paths across different filesystems
 * 
 * @param from Source directory
 * @param to Destination directory
 */
export async function copy_dir_all(from: string, to: string) {
    await invoke("copy_dir_all", { from, to });
}