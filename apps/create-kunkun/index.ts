#!/usr/bin/env node
import path from "path"
import { input, select } from "@inquirer/prompts"
import { version as kkApiVersion } from "@kksh/api/package.json"
import chalk from "chalk"
import { Command, Option } from "commander"
import fs from "fs-extra"
import pkgJson from "./package.json"
import { createKunkunVersion, getTemplateRoot, isProduction } from "./src/constants"
import { cleanExtension, patchHBS, patchManifestJsonSchema, patchPkgJsonDep } from "./src/patch"
import { getLatestNpmPkgVersion, tarExtract } from "./src/utils"

console.log(`${chalk.blue("create-kunkun version:")} ${createKunkunVersion}`)
const latestCreateKunkunVersion = await getLatestNpmPkgVersion("create-kunkun")
console.log(`${chalk.blue("Latest create-kunkun version:")} latestCreateKunkunVersion`)
if (latestCreateKunkunVersion !== createKunkunVersion) {
	const msg = `You are using create-kunkun version ${createKunkunVersion}, but the latest version is ${latestCreateKunkunVersion}. It may not work with the latest Kunkun app.`
	console.warn(chalk.red(msg))
}

const cwd = process.cwd()
const templateRoot = getTemplateRoot()
console.info(`${chalk.blue("Current Working Directory")}: ${cwd}`)
console.info(`${chalk.blue("Template Root:")}`, templateRoot)
if (!fs.existsSync(templateRoot)) {
	console.error(`Template directory not found; Expected at ${templateRoot}`)
	process.exit(1)
}
const program = new Command()

program
	.version(pkgJson.version)
	.addOption(
		new Option("-t, --template <template>", "Extension Template").choices([
			"template",
			"react",
			"vue",
			"svelte",
			"nuxt",
			"sveltekit",
			"next"
		])
	)
	.addOption(new Option("-n, --name <name>", "Extension Name"))
	.addOption(new Option("-f, --force", "Overwrite existing files").default(false))
	.addOption(new Option("-o, --outdir <outdir>", "Output directory").default(cwd))
	.parse(process.argv)
type Template = "react" | "template" | "vue" | "svelte" | "nuxt" | "sveltekit" | "next"
const options = program.opts<{
	template?: Template
	outdir: string
	force: boolean
	name?: string
}>()
let template: Template | undefined = options.template
let name = options.name
console.log("Options:", options)

const outdir = path.resolve(options.outdir)
console.info(`${chalk.blue("Outdir: ")}${outdir}`)
if (!fs.existsSync(outdir)) {
	fs.mkdirSync(outdir, { recursive: true })
}

async function copyTemplate(templateTgz: string, targetFolderName: string): Promise<string> {
	const destDir = path.join(outdir, targetFolderName)

	if (!fs.existsSync(templateTgz)) {
		console.error(`Worker Extension Template not found at ${templateTgz}`)
		process.exit(1)
	}
	console.info(`${chalk.blue("Template Source Path:")} ${templateTgz}`)
	if (fs.existsSync(destDir)) {
		if (!options.force) {
			console.error(`Destination directory already exists: ${destDir}`)
			process.exit(1)
		} else {
			fs.removeSync(destDir)
		}
	}
	await tarExtract(templateTgz, destDir)
	// fs.mkdirSync(destDir, { recursive: true })
	console.info(
		`Template copied from \n\t${chalk.blue(templateTgz)} \nto \n\t${chalk.blue(destDir)}`
	)
	// fs.copySync(templateTgz, destDir)
	return destDir
}

;(async function () {
	if (!template) {
		template = await select({
			message: "Select an Extension Template",
			choices: [
				{
					name: "Preset Template (Web Worker)",
					value: "template",
					description:
						"Write regular logic in TypeScript in OOP manner to render extension UI based on predefined template."
				},
				{
					name: "React Custom UI",
					value: "react",
					description:
						"Extension will be rendered within iframe as a regular web app. The UI can be arbitrarily complex. Choose this if you want to use React to build complex UI."
				},
				{
					name: "Vue Custom UI",
					value: "vue",
					description:
						"Extension will be rendered within iframe as a regular web app. The UI can be arbitrarily complex. Choose this if you want to use React to build complex UI."
				},
				{
					name: "Svelte Custom UI",
					value: "svelte",
					description:
						"Extension will be rendered within iframe as a regular web app. The UI can be arbitrarily complex. Choose this if you want to use React to build complex UI."
				},
				{
					name: "Nuxt Custom UI",
					value: "nuxt",
					description:
						"Extension will be rendered within iframe as a regular web app. The UI can be arbitrarily complex. Choose this if you want to use Nuxt to build complex UI."
				},
				{
					name: "Next.js Custom UI",
					value: "next",
					description:
						"Extension will be rendered within iframe as a regular web app. The UI can be arbitrarily complex. Choose this if you want to use Next.js to build complex UI."
				},
				{
					name: "Sveltekit Custom UI",
					value: "sveltekit",
					description:
						"Extension will be rendered within iframe as a regular web app. The UI can be arbitrarily complex. Choose this if you want to use Sveltekit to build complex UI."
				}
			]
		})
	}
	if (!name) {
		name = await input({
			message: "Enter Extension Name",
			default: `kunkun-extension-${template}`
		})
	}
	let destDir = ""
	if (template === "template") {
		destDir = await copyTemplate(path.join(templateRoot, "template-ext-worker.tgz"), name)
		cleanExtension(destDir)
	} else if (["react", "vue", "svelte", "nuxt", "sveltekit", "next"].includes(template)) {
		destDir = await copyTemplate(path.join(templateRoot, `template-ext-${template}.tgz`), name)
		cleanExtension(destDir)
	} else {
		console.error("Invalid template")
		process.exit(1)
	}
	console.log("Destination Dir:", destDir)
	if (!isProduction) {
		const pkgJsonPath = path.join(destDir, "package.json")
		patchManifestJsonSchema(pkgJsonPath)
		patchPkgJsonDep(pkgJsonPath)
	}

	/* -------------------------------------------------------------------------- */
	/*                             Patch HBS Templates                            */
	/* -------------------------------------------------------------------------- */
	console.log(`Start Patching ${name}`)

	await new Promise((resolve) => setTimeout(resolve, 1000)) // add some delay after files are created, otherwsie files can't be overwritten
	patchHBS(path.join(destDir, "package.json"), { projectName: name })
	switch (template) {
		case "nuxt":
			patchHBS(path.join(destDir, "nuxt.config.ts"), { projectName: name })
			break
		case "react":
			patchHBS(path.join(destDir, "vite.config.ts"), { projectName: name })
			break
		case "vue":
			patchHBS(path.join(destDir, "vite.config.ts"), { projectName: name })
			break
		case "svelte":
			patchHBS(path.join(destDir, "vite.config.ts"), { projectName: name })
			break
		case "sveltekit":
			patchHBS(path.join(destDir, "svelte.config.js"), { projectName: name })
			break
		case "next":
			patchHBS(path.join(destDir, "next.config.mjs"), { projectName: name })
			break
		default:
			break
	}
})()
