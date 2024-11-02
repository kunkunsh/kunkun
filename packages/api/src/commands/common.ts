export const JarvisPluginCommandPrefix = "plugin:jarvis"

export function generateJarvisPluginCommand(command: string) {
	return `${JarvisPluginCommandPrefix}|${command}`
}
