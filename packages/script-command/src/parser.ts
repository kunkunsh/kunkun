import * as v from "valibot"
import { ScriptCommandConfig } from "./models"

/**
 * Parse script command from comments of file content
 * @param fileContent
 * @param fileType
 */
export function parseScriptCommand(
	fileContent: string,
	fileType: "js" | "py" | "rb" | "sh" | "swift" | "ts" | "scpt"
): ScriptCommandConfig {
	const config: any = { scriptPath: null }

	// Split content into lines and process each line
	const lines = fileContent.split("\n")

	for (const line of lines) {
		// Look for lines containing @raycast. or @kunkun. metadata
		if (line.includes("@raycast.") || line.includes("@kunkun.")) {
			const trimmedLine = line.trim()
			// Remove any comment markers based on file type
			const cleanedLine = trimmedLine
				.replace(/^#\s*/, "") // Python/Ruby style comments
				.replace(/^\/\/\s*/, "") // JavaScript/TypeScript style comments
				.trim()

			// Extract parameter name and value, supporting both @raycast and @kunkun
			const match = cleanedLine.match(/@(raycast|kunkun)\.(\w+)\s+(.+)/)
			if (match) {
				const [, prefix, param, value] = match
				switch (param) {
					case "schemaVersion":
						config.schemaVersion = parseInt(value, 10)
						break
					case "title":
						config.title = value
						break
					case "mode":
						config.mode = value as any
						break
					case "packageName":
						config.packageName = value
						break
					case "icon":
						config.icon = value
						break
					case "description":
						config.description = value
						break
					case "author":
						config.author = value
						break
					case "authorURL":
						config.authorURL = value
						break
					case "needsConfirmation":
						config.needsConfirmation = value.toLowerCase() === "true"
						break
				}
			}
		}
	}

	return v.parse(ScriptCommandConfig, config)
}
