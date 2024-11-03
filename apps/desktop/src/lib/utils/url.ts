export function trimSlash(str: string) {
	return str.replace(/^\/+|\/+$/g, "")
}
