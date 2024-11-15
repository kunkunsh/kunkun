import path from "path"
import { NODE_ENV } from "@/constants"
import logger from "@/logger"
import { CustomUiCmd, ExtPackageJson, TemplateUiCmd } from "@kksh/api/models"
import { printTable } from "console-table-printer"
import fs from "fs-extra"
import * as v from "valibot"

export function verifyCustomUiCommand(projectRoot: string, cmd: CustomUiCmd): boolean {
	if (!cmd.main.startsWith("http")) {
		const mainPath = path.join(projectRoot, cmd.dist, cmd.main)
		if (
			!(
				fs.existsSync(mainPath) ||
				fs.existsSync(mainPath + ".html") ||
				fs.existsSync(path.join(mainPath, "index.html"))
			)
		) {
			logger.error(`main file not found at '${mainPath}' for command ${cmd.name}`)
			return false
		}
	}
	return true
}

export function verifyTemplateUiCommand(projectRoot: string, cmd: TemplateUiCmd): boolean {
	const mainPath = path.join(projectRoot, cmd.main)
	if (!fs.existsSync(mainPath)) {
		logger.error(`main file not found at ${mainPath} for command ${cmd.name}`)
		return false
	}
	return true
}

export function verifySingleProject(projectPath: string): boolean {
	logger.info(`Verifying project at ${projectPath}`)
	const pkgJsonPath = path.join(projectPath, "package.json")
	if (!fs.existsSync(pkgJsonPath)) {
		logger.error(`package.json not found at [${pkgJsonPath}]`)
		return false
	}
	const pkgJson = fs.readJSONSync(pkgJsonPath)
	const result = v.safeParse(ExtPackageJson, pkgJson)

	if (!result.success) {
		logger.error("package.json is invalid, see issues below:")
		console.error(v.flatten<typeof ExtPackageJson>(result.issues))
		return false
	}
	const pkg = result.output
	logger.info(`package.json is valid`)
	logger.info(`name`, pkg.name)
	logger.info(`version`, pkg.version)
	logger.info(`identifier`, pkg.kunkun.identifier)
	if (pkg.files.length === 0) {
		logger.warn(
			`"files" field is empty, it is recommended to include only the necessary files, e.g. dist`
		)
	}
	// check if kunkun extension name is the same as the folder name
	const folderName = path.basename(projectPath)

	if (NODE_ENV === "test") {
		// if (pkg.kunkun.identifier === "{{projectName}}") {
		console.log("Patching project name from {{projectName}} to", folderName)
		pkg.kunkun.identifier = folderName
		// }
	}
	if (pkg.kunkun.identifier !== folderName) {
		logger.error(
			`Extension package name at [pkg.kunkun.identifier](${pkg.kunkun.identifier}) is not the same as the folder name [${folderName}], please fix it`
		)
		return false
	}
	for (const cmd of pkg.kunkun.customUiCmds) {
		if (!verifyCustomUiCommand(projectPath, cmd)) {
			return false
		}
	}
	for (const cmd of pkg.kunkun.templateUiCmds) {
		if (!verifyTemplateUiCommand(projectPath, cmd)) {
			return false
		}
	}
	return true
}

export function verifyCmd(projectPath: string, batch: boolean): boolean {
	let success = true
	if (!batch) {
		success = verifySingleProject(projectPath)
	} else {
		const records: { valid: boolean; path: string }[] = []
		fs.readdirSync(projectPath).forEach((dir) => {
			const dirPath = path.join(projectPath, dir)
			if (fs.existsSync(path.join(dirPath, "package.json"))) {
				records.push({ path: dirPath, valid: verifySingleProject(dirPath) })
				logger.printDivider("=")
			}
		})
		printTable(records)
		success = records.every((record) => record.valid)
	}
	return success
}
export default verifyCmd
