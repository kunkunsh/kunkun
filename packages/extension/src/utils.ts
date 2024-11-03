/**
 * Check if the extension path is in dev mode
 * @param extPath - The main extension path
 * @param candidateExtPath - The candidate extension path
 * @returns True if the extension path is in dev mode, false otherwise
 */
export function isExtPathInDev(extPath: string, candidateExtPath: string) {
	return !candidateExtPath.startsWith(extPath)
}
