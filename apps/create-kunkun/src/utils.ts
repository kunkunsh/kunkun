import os from "os"
import path from "path"
import chalk from "chalk"
import fs from "fs-extra"
import { create as createTar, extract as extractTar } from "tar"
import * as v from "valibot"
import { getRootDir, isProduction } from "../src/constants"

export function getLatestNpmPkgInfo(pkgName: string): Promise<Record<string, any>> {
	return fetch(`https://registry.npmjs.org/${pkgName}/latest`).then((res) => res.json())
}

export function getLatestNpmPkgVersion(pkgName: string): Promise<string> {
	return getLatestNpmPkgInfo(pkgName).then(
		(data) => v.parse(v.object({ version: v.string() }), data).version
	)
}

/**
 * Obtain the current package verisons of all packages in the monorepo
 * This function is used only in development mode
 * @returns
 */
export async function findPkgVersions() {
	if (isProduction) {
		throw new Error("This function is only available in development mode")
	}
	const pkgVersions: Record<string, string> = {}
	const root = getRootDir()
	const repoRoot = path.join(root, "../../")
	const searchFolders = [path.join(repoRoot, "apps"), path.join(repoRoot, "packages")]
	for (const folder of searchFolders) {
		const packages = fs.readdirSync(folder)
		// console.log("Packages: ", packages);

		for (const pkg of packages) {
			const pkgJsonPath = path.join(folder, pkg, "package.json")
			if (fs.existsSync(pkgJsonPath)) {
				const pkgJson = fs.readJsonSync(pkgJsonPath)
				pkgVersions[pkgJson.name] = pkgJson.version
			}
		}
	}
	for (const pkgName of ["@kksh/vue", "@kksh/react", "@kksh/svelte"]) {
		const version = await getLatestNpmPkgVersion(pkgName)
		pkgVersions[pkgName] = version
	}
	return pkgVersions
}

export function tarCompress(src: string, dest: string) {
	// get src parent dir
	const srcParentDir = path.dirname(src)
	const srcFileName = path.basename(src)
	return createTar(
		{
			file: dest,
			gzip: true,
			cwd: srcParentDir,
			filter: (path) => {
				const ignoreList = ["node_modules", "dist", ".turbo", "extensions_support"]
				return !ignoreList.some((ignore) => path.includes(ignore))
			}
		},
		[srcFileName]
	)
}

export function tarExtract(src: string, dest: string) {
	const srcFileName = path.basename(src)
	const destDir = path.dirname(dest)
	const destFolderName = path.basename(dest)
	if (!fs.existsSync(destDir)) {
		fs.mkdirSync(destDir, { recursive: true })
	}
	if (fs.existsSync(dest)) {
		const msg = `${dest} already exists`
		console.log(chalk.red(msg))
		process.exit(1)
	}

	// get a tmp dir
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "create-kunkun-extract"))

	if (fs.existsSync(tmpDir)) {
		// remove tmp dir
		fs.rmSync(tmpDir, { recursive: true })
	}
	fs.mkdirSync(tmpDir, { recursive: true })
	return extractTar({
		file: src,
		C: tmpDir
	}).then(() => {
		const srcFileNameExt = path.extname(src)
		const srcFileNameWithoutExt = path.basename(src, srcFileNameExt)

		const intermediateDest = path.join(tmpDir, srcFileNameWithoutExt)
		if (!fs.existsSync(intermediateDest)) {
			const msg = `Intermediate destination ${intermediateDest} not found, extraction failed`
			console.log(chalk.red(msg))
			process.exit(1)
		}
		// move intermediateDest to dest
		fs.copySync(intermediateDest, dest)
		// remove tmp dir
		fs.rmSync(tmpDir, { recursive: true })
	})
}
