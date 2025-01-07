import fs from "fs"
import path from "path"
import { getRootDir } from "@/constants"
import { buildWithDockerAndValidate } from "@/utils"

export async function buildCmd(projectPath: string, entrypoint?: string) {
	const rootDir = getRootDir()
	const entrypointPath = entrypoint
		? fs.existsSync(entrypoint)
			? entrypoint
			: path.join(rootDir, entrypoint)
		: undefined
	const buildResult = await buildWithDockerAndValidate(
		projectPath,
		entrypointPath && fs.existsSync(entrypointPath) ? entrypointPath : undefined
	)
	console.log(buildResult)
}

export default buildCmd
