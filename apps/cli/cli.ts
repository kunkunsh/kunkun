#!/usr/bin/env node
import fs from "fs"
import path from "path"
import { verifyCmd } from "@/commands"
import { NODE_ENV } from "@/constants"
import logger from "@/logger"
import { program } from "commander"
import { version } from "./package.json"

const cwd = process.cwd()
console.log("Environment:", NODE_ENV)

program.name("Kunkun CLI").description("CLI for Kunkun Extension Development").version(version)

function computeProjectDir(projectPath: string | undefined) {
	if (!projectPath) {
		projectPath = cwd
	} else if (fs.existsSync(projectPath)) {
		projectPath = path.resolve(projectPath)
	} else if (fs.existsSync(path.join(cwd, projectPath))) {
		projectPath = path.join(cwd, projectPath)
	} else {
		logger.error("Invalid project path")
		process.exit(1)
	}
	return projectPath
}

program
	.command("verify [project_path]")
	.description("Verify the validity of a Kunkun extension")
	.option("-b, --batch", "Batch mode", false)
	.option("-p, --publish", "Publish Mode. Will exit with 1 if invalid", false)
	.action((projectPath: string | undefined, opts: { batch: boolean; publish: boolean }) => {
		logger.info("cwd:", cwd)
		const valid = verifyCmd(computeProjectDir(projectPath), opts.batch)
		if (opts.publish && !valid) {
			process.exit(1)
		}
	})

program.parse()
