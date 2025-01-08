import {expect, test} from 'bun:test'
import {getJsrPackageHtml, getJsrPackageMetadata, signedByGitHubAction} from '../src/jsr'

test("Get Package Html", async () => {
    const html = await getJsrPackageHtml('kunkun', 'kkrpc')
    expect(html).toBeDefined()
})

test("Signed By GitHub Action", async () => {
    const kkrpcSigned = await signedByGitHubAction('kunkun', 'kkrpc')
    expect(kkrpcSigned).toBe(true)
    const kkrpcSignedVersion = await signedByGitHubAction('kunkun', 'kkrpc', '0.0.14')
    expect(kkrpcSignedVersion).toBe(true)
    const kunkunApiSigned = await signedByGitHubAction('kunkun', 'api', "0.0.47")
    expect(kunkunApiSigned).toBe(false)
})

test("Get Package Metadata", async () => {
    const metadata = await getJsrPackageMetadata('kunkun', 'api')
    console.log(metadata);
    expect(metadata).toBeDefined()
})