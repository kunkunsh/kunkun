export function getJsrPackageHtml(scope: string, name: string, version?: string) {
    const url = `https://jsr.io/@${scope}/${name}${version ? `@${version}` : ''}`
    return fetch(url, {
        headers: {
            "sec-fetch-dest": "document"
        }
    }).then(res => res.text())
}

export function signedByGitHubAction(scope: string, name: string, version?: string) {
    return getJsrPackageHtml(scope, name, version).then(html => html.includes('Built and signed on GitHub Actions'))
}

export function getJsrPackageMetadata(scope: string, name: string) {
    const url = `https://jsr.io/@${scope}/${name}/meta.json`
    return fetch(url).then(res => res.json())
}
