export function styleObjectToString(style: Record<string, string>) {
	return Object.entries(style)
		.map(([key, value]) => `${key}: ${value};`)
		.join("")
}
