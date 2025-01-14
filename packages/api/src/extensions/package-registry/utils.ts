/**
 * Get the tarball size of a package
 * @param url tarball url, can technically be any url
 * @returns tarball size in bytes
 */
export function getTarballSize(url: string): Promise<number> {
	return fetch(url, { method: "HEAD" }).then((res) => {
		if (!(res.ok && res.status === 200)) {
			throw new Error("Failed to fetch tarball size")
		}
		return Number(res.headers.get("Content-Length"))
	})
}
