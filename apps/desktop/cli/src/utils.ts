import { exec, spawn } from "child_process"
import crypto from "crypto"
import path from "path"
import { ExtPackageJson } from "@kksh/api/models"
import fs from "fs-extra"
import * as v from "valibot"
import { getDockerEntrypoint } from "./constants"
import type { BuildResult } from "./types"

/**
 * Package Name can be scoped or not
 * Use regex to extract package name
 * @param packageName
 * @param version
 */
export function computeTarballName(packageName: string, version: string): string {
	const scoped = packageName.startsWith("@")
	if (scoped) {
		const [scope, name] = packageName.split("/")
		return `${scope.substring(1)}-${name}-${version}.tgz`
	} else {
		return `${packageName}-${version}.tgz`
	}
}

export function computeFileHash(filePath: string, algorithm: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash(algorithm)
		const stream = fs.createReadStream(filePath)

		stream.on("data", (data) => {
			// @ts-ignore
			hash.update(data)
		})

		stream.on("end", () => {
			const shasum = hash.digest("hex")
			resolve(shasum)
		})

		stream.on("error", (err) => {
			reject(err)
		})
	})
}

export function computeFileSha1(filePath: string): Promise<string> {
	return computeFileHash(filePath, "sha1")
}

export function computeFileSha512(filePath: string): Promise<string> {
	return computeFileHash(filePath, "sha512")
}

export function computeHash(buffer: Buffer, algorithm: "sha1" | "sha256" | "sha512") {
	const hash = crypto.createHash(algorithm)
	// @ts-ignore
	hash.update(buffer)
	return hash.digest("hex")
}

/**
 * Docker is used to build each individual extension for safety
 * Packages could potentially modify other extensions if they share environment.
 * There is also a possibility of leaking environment variables.
 * docker run -v $(pwd)/scripts/docker/entrypoint.sh:/entrypoint.sh \
 *     -v $(pwd)/extensions/$ext:/workspace \
 *     -w /workspace --rm \
 *     --platform=linux/amd64 \
 *     node:20 /entrypoint.sh
 * @param extPath
 * @returns shasum of the tarball parsed from stderr output
 */
export function buildWithDocker(extPath: string): Promise<{
	stderrShasum: string
	stderrTarballFilename: string
	pkg: ExtPackageJson
}> {
	console.log(`Building ${extPath}`)
	return new Promise((resolve, reject) => {
		const pkg = v.parse(ExtPackageJson, fs.readJsonSync(path.join(extPath, "package.json")))
		const dockerEntrypoint = getDockerEntrypoint()
		console.log("Docker Entrypoint", dockerEntrypoint)

		const dockerCmd = `
    run -v ${dockerEntrypoint}:/entrypoint.sh -v ${extPath}:/workspace -w /workspace --rm huakunshen/kunkun-ext-builder:latest /entrypoint.sh`
		console.log("dockerCmd", dockerCmd)
		const args = dockerCmd
			.split(" ")
			.filter((arg) => arg.length > 0)
			.filter((arg) => arg !== "\n")
		const subprocess = spawn("docker", args)
		let stderrShasum = ""
		let stderrTarballFilename = ""
		subprocess.stdout.on("data", (data) => {
			console.log(`stdout: ${data}`)
		})
		subprocess.stderr.on("data", (data) => {
			const dataStr = data.toString()
			console.error(`stderr: ${dataStr}`)
			//   if (data instanceof String) {
			if (dataStr.includes("npm notice shasum")) {
				console.log("shasum found")
				const shasumMatch = dataStr.match(/npm notice shasum:\s+([a-f0-9]+)/)

				if (shasumMatch) {
					stderrShasum = shasumMatch[1]
					console.log("Parsed shasum:", stderrShasum)
				}
			}

			if (dataStr.includes("npm notice filename:")) {
				const tarballFilename = dataStr.match(/npm notice filename:\s+([^\s]+)/)
				if (tarballFilename) {
					stderrTarballFilename = tarballFilename[1]
					console.log("Parsed tarball:", stderrTarballFilename)
				}
			} else if (dataStr.includes("filename:")) {
				const tarballFilename = dataStr.match(/filename:\s+([^\s]+)/)
				if (tarballFilename) {
					stderrTarballFilename = tarballFilename[1]
					console.log("Parsed tarball:", stderrTarballFilename)
				}
			}
			//   } else {
			//     console.error("data is not string");
			//   }
		})
		subprocess.on("close", (code) => {
			console.log(`child process exited with code ${code}`)
			if (stderrShasum.trim().length === 0 || stderrTarballFilename.trim().length === 0) {
				return reject("shasum or tarball filename not found")
			}
			if (code !== 0) {
				return reject(`child process exited with code ${code}`)
			} else {
				return resolve({ stderrShasum, stderrTarballFilename, pkg })
			}
		})
	})
}

/**
 * Use this function to build an extension with docker and validate the tarball
 * If this passes, the tarball is ready to be inserted into the database
 * @param extPath Extension Path
 * @returns
 */
export function buildWithDockerAndValidate(extPath: string): Promise<BuildResult> {
	return buildWithDocker(extPath)
		.then((res) => {
			const parsedTarballPath = path.join(extPath, res.stderrTarballFilename)
			if (!fs.existsSync(parsedTarballPath)) {
				console.error(`Tarball not found: ${parsedTarballPath}`)
				process.exit(1)
			}
			return computeFileSha1(parsedTarballPath).then((computedShasum) => {
				if (computedShasum !== res.stderrShasum) {
					console.error(
						`Shasum mismatch: Computed(${computedShasum}) !== Output from docker(${res.stderrShasum})`
					)
					process.exit(1)
				} else {
					console.log("Shasum matches")
				}
				return {
					shasum: computedShasum,
					tarballFilename: res.stderrTarballFilename,
					tarballPath: parsedTarballPath,
					extPath: extPath,
					pkg: res.pkg
				}
			})
		})
		.catch((err) => {
			console.error(err)
			process.exit(1)
		})
}
