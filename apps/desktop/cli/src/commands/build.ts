import { getRootDir } from "@/constants"
import { buildWithDockerAndValidate } from "@/utils"

export async function buildCmd(projectPath: string) {
	const rootDir = getRootDir()
	console.log("rootDir: ", rootDir)

	const buildResult = await buildWithDockerAndValidate(projectPath)
	console.log(buildResult)
}

export default buildCmd
