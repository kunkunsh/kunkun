/**
 * Get the tarball size of a package
 * @param url tarball url, can technically be any url
 * @returns tarball size in bytes
 */
export function getTarballSize(url: string, method: "HEAD" | "GET" = "HEAD"): Promise<number> {
	return fetch(url, { method }).then((res) => {
		if (!(res.ok && res.status === 200)) {
			throw new Error("Failed to fetch tarball size")
		}
		return Number(res.headers.get("Content-Length"))
	})
}
