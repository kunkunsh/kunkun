import { join } from "@tauri-apps/api/path"
import { exists } from "@tauri-apps/plugin-fs"
import { difference } from "lodash"
import type { InternalSpawnOptions, SpawnOptions } from "tauri-plugin-shellx-api"
import { safeParse } from "valibot"
import {
	PermissionScopeSchema,
	ShellPermissionScopedSchema,
	type ShellPermission,
	type ShellPermissionScoped
} from "../../permissions/schema"
import {
	AllPathAliases,
	matchPathAndScope,
	pathStartsWithAlias,
	translateScopeToPath
} from "../../utils/path"
import { type DenoRunConfig } from "../client"

/**
 *
 * @param userPermissionScopes
 * @param program should be deno for now, may be I will support custom deno path in the future
 * @param scriptPath absolute path to deno script
 * @param config Deno config from extension API call
 */
export async function verifyDenoCmdPermission(
	userPermissionScopes: ShellPermissionScoped[],
	program: string,
	scriptPath: string,
	config: Partial<DenoRunConfig> & SpawnOptions,
	extensionDir: string
) {
	scriptPath = await translateScopeToPath(scriptPath, extensionDir)
	if (!(await exists(scriptPath)) && config.cwd) {
		scriptPath = await join(config.cwd, scriptPath)
	}
	const userDenoPerms = userPermissionScopes.filter(
		(p) => p.permission && p.permission.startsWith("shell:deno:")
	)
	const pathMatchedPerms: ShellPermissionScoped[] = []
	for (const perm of userDenoPerms) {
		const safeParsed = safeParse(ShellPermissionScopedSchema, perm)
		if (!safeParsed.success) {
			throw new Error(`Invalid permission: ${perm}`)
		}
		const parsedPerm = safeParsed.output
		// ignore the ones whose path doesn't match
		let pathMatched = false
		if (parsedPerm.allow) {
			for (const allow of parsedPerm.allow) {
				if (allow.path && (await matchPathAndScope(scriptPath, allow.path, extensionDir))) {
					pathMatched = true
				}
			}
		}
		if (parsedPerm.deny) {
			for (const deny of parsedPerm.deny) {
				if (deny.path && (await matchPathAndScope(scriptPath, deny.path, extensionDir))) {
					pathMatched = true
				}
			}
		}
		if (pathMatched) {
			pathMatchedPerms.push(parsedPerm)
		}
	}

	/* -------------------- Start Verifying Deno Permissions -------------------- */
	const allowEnv: string[] = []
	let allowAllEnv = false
	const denyEnv: string[] = []
	let denyAllEnv = false
	const allowNet: string[] = []
	let allowAllNet = false
	const denyNet: string[] = []
	let denyAllNet = false
	let allowRead: string[] = []
	let allowAllRead = false
	let denyRead: string[] = []
	let denyAllRead = false
	let allowWrite: string[] = []
	let allowAllWrite = false
	let denyWrite: string[] = []
	let denyAllWrite = false
	const allowRun: string[] = []
	let allowAllRun = false
	const denyRun: string[] = []
	let denyAllRun = false
	const allowFfi: string[] = []
	let allowAllFfi = false
	const denyFfi: string[] = []
	let denyAllFfi = false
	const allowSys: string[] = []
	let allowAllSys = false
	const denySys: string[] = []
	let denyAllSys = false

	for (const perm of pathMatchedPerms) {
		if (perm.allow) {
			for (const allow of perm.allow) {
				if (allow.env) {
					if (allow.env === "*") {
						allowAllEnv = true
					} else {
						allowEnv.push(...allow.env)
					}
				}
				if (allow.net) {
					if (allow.net === "*") {
						allowAllNet = true
					} else {
						allowNet.push(...allow.net)
					}
				}
				if (allow.read) {
					if (allow.read === "*") {
						allowAllRead = true
					} else {
						allowRead.push(...allow.read)
					}
				}
				if (allow.write) {
					if (allow.write === "*") {
						allowAllWrite = true
					} else {
						allowWrite.push(...allow.write)
					}
				}
				if (allow.run) {
					if (allow.run === "*") {
						allowAllRun = true
					} else {
						allowRun.push(...allow.run)
					}
				}
				if (allow.ffi) {
					if (allow.ffi === "*") {
						allowAllFfi = true
					} else {
						allowFfi.push(...allow.ffi)
					}
				}
				if (allow.sys) {
					if (allow.sys === "*") {
						allowAllSys = true
					} else {
						allowSys.push(...allow.sys)
					}
				}
			}
		}
		if (perm.deny) {
			for (const deny of perm.deny) {
				if (deny.env) {
					if (deny.env === "*") {
						denyAllEnv = true
					} else {
						denyEnv.push(...deny.env)
					}
				}
				if (deny.net) {
					if (deny.net === "*") {
						denyAllNet = true
					} else {
						denyNet.push(...deny.net)
					}
				}
				if (deny.read) {
					if (deny.read === "*") {
						denyAllRead = true
					} else {
						denyRead.push(...deny.read)
					}
				}
				if (deny.write) {
					if (deny.write === "*") {
						denyAllWrite = true
					} else {
						denyWrite.push(...deny.write)
					}
				}
				if (deny.run) {
					if (deny.run === "*") {
						denyAllRun = true
					} else {
						denyRun.push(...deny.run)
					}
				}
				if (deny.ffi) {
					if (deny.ffi === "*") {
						denyAllFfi = true
					} else {
						denyFfi.push(...deny.ffi)
					}
				}
				if (deny.sys) {
					if (deny.sys === "*") {
						denyAllSys = true
					} else {
						denySys.push(...deny.sys)
					}
				}
			}
		}
	}
	/* ------------- Translate Paths for read and write Permissions ------------- */
	allowRead = await Promise.all(
		allowRead.map(async (p) =>
			pathStartsWithAlias(p) ? await translateScopeToPath(p, extensionDir) : p
		)
	)

	if (config.allowRead) {
		config.allowRead = await Promise.all(
			config.allowRead.map(async (p) => await translateScopeToPath(p, extensionDir))
		)
	}

	if (config.denyRead) {
		config.denyRead = await Promise.all(
			config.denyRead.map(async (p) => await translateScopeToPath(p, extensionDir))
		)
	}

	if (config.allowWrite) {
		config.allowWrite = await Promise.all(
			config.allowWrite.map(async (p) => await translateScopeToPath(p, extensionDir))
		)
	}

	if (config.denyWrite) {
		config.denyWrite = await Promise.all(
			config.denyWrite.map(async (p) => await translateScopeToPath(p, extensionDir))
		)
	}

	denyRead = await Promise.all(
		denyRead.map(async (p) =>
			pathStartsWithAlias(p) ? await translateScopeToPath(p, extensionDir) : p
		)
	)

	allowWrite = await Promise.all(
		allowWrite.map(async (p) =>
			pathStartsWithAlias(p) ? await translateScopeToPath(p, extensionDir) : p
		)
	)

	denyWrite = await Promise.all(
		denyWrite.map(async (p) =>
			pathStartsWithAlias(p) ? await translateScopeToPath(p, extensionDir) : p
		)
	)

	// now we have command requested permissions, we need to compare with permissions defined in manifest
	/* ----------------------- Check Allow All Permissions ---------------------- */
	console.log("config: ", config)
	console.log("allowAllEnv: ", allowAllEnv)

	if (config.allowAllEnv && !allowAllEnv) {
		throw new Error("allowAllEnv is not allowed")
	}
	if (config.allowAllNet && !allowAllNet) {
		throw new Error("allowAllNet is not allowed")
	}
	if (config.allowAllRead && !allowAllRead) {
		throw new Error("allowAllRead is not allowed")
	}
	if (config.allowAllWrite && !allowAllWrite) {
		throw new Error("allowAllWrite is not allowed")
	}
	if (config.allowAllRun && !allowAllRun) {
		throw new Error("allowAllRun is not allowed")
	}
	if (config.allowAllFfi && !allowAllFfi) {
		throw new Error("allowAllFfi is not allowed")
	}
	if (config.allowAllSys && !allowAllSys) {
		throw new Error("allowAllSys is not allowed")
	}

	if (!allowAllEnv && difference(config.allowEnv, allowEnv).length > 0) {
		throw new Error(`allowEnv is not allowed: ${difference(config.allowEnv, allowEnv)}`)
	}
	if (!allowAllNet && difference(config.allowNet, allowNet).length > 0) {
		throw new Error(`allowNet is not allowed: ${difference(config.allowNet, allowNet)}`)
	}
	if (!allowAllRead && difference(config.allowRead, allowRead).length > 0) {
		throw new Error(`allowRead is not allowed: ${difference(config.allowRead, allowRead)}`)
	}
	if (!allowAllWrite && difference(config.allowWrite, allowWrite).length > 0) {
		throw new Error(`allowWrite is not allowed: ${difference(config.allowWrite, allowWrite)}`)
	}
	if (!allowAllRun && difference(config.allowRun, allowRun).length > 0) {
		throw new Error(`allowRun is not allowed: ${difference(config.allowRun, allowRun)}`)
	}
	if (!allowAllFfi && difference(config.allowFfi, allowFfi).length > 0) {
		throw new Error(`allowFfi is not allowed: ${difference(config.allowFfi, allowFfi)}`)
	}
	if (!allowAllSys && difference(config.allowSys, allowSys).length > 0) {
		throw new Error(`allowSys is not allowed: ${difference(config.allowSys, allowSys)}`)
	}
}

/* -------------------------------------------------------------------------- */
/*                 Translate Deno Command to a regular command                */
/* -------------------------------------------------------------------------- */

/**
 * Translate deno script command to a regular shell command
 * @param scriptPath
 * @param config
 * @returns
 */
export async function translateDenoCommand(
	scriptPath: string,
	config: Partial<DenoRunConfig> & SpawnOptions,
	args: string[],
	extensionDir: string
): Promise<{
	program: string
	args: string[]
	options: InternalSpawnOptions
}> {
	const program = "deno" // TODO: support custom deno path
	const shellArgs: string[] = ["run"]
	/* ----------------------------------- Env ---------------------------------- */
	if (config.allowAllEnv) {
		shellArgs.push("--allow-env")
	} else if (config.allowEnv) {
		const allowEnvStr = config.allowEnv.join(",")
		shellArgs.push(`--allow-env=${allowEnvStr}`)
	}
	if (config.denyAllEnv) {
		shellArgs.push("--deny-env")
	} else if (config.denyEnv) {
		const denyEnvStr = config.denyEnv.join(",")
		shellArgs.push(`--deny-env=${denyEnvStr}`)
	}
	/* ----------------------------------- Net ---------------------------------- */
	if (config.allowAllNet) {
		shellArgs.push("--allow-net")
	} else if (config.allowNet) {
		const allowNetStr = config.allowNet.join(",")
		shellArgs.push(`--allow-net=${allowNetStr}`)
	}
	if (config.denyAllNet) {
		shellArgs.push("--deny-net")
	} else if (config.denyNet) {
		const denyNetStr = config.denyNet.join(",")
		shellArgs.push(`--deny-net=${denyNetStr}`)
	}
	/* ----------------------------------- Read ---------------------------------- */
	if (config.allowAllRead) {
		shellArgs.push("--allow-read")
	} else if (config.allowRead) {
		const allowReadStr = config.allowRead.join(",")
		shellArgs.push(`--allow-read=${allowReadStr}`)
	}
	if (config.denyAllRead) {
		shellArgs.push("--deny-read")
	} else if (config.denyRead) {
		const denyReadStr = config.denyRead.join(",")
		shellArgs.push(`--deny-read=${denyReadStr}`)
	}
	/* ----------------------------------- Write ---------------------------------- */
	if (config.allowAllWrite) {
		shellArgs.push("--allow-write")
	} else if (config.allowWrite) {
		const allowWriteStr = config.allowWrite.join(",")
		shellArgs.push(`--allow-write=${allowWriteStr}`)
	}
	if (config.denyAllWrite) {
		shellArgs.push("--deny-write")
	} else if (config.denyWrite) {
		const denyWriteStr = config.denyWrite.join(",")
		shellArgs.push(`--deny-write=${denyWriteStr}`)
	}
	/* ----------------------------------- Run ---------------------------------- */
	if (config.allowAllRun) {
		shellArgs.push("--allow-run")
	} else if (config.allowRun) {
		const allowRunStr = config.allowRun.join(",")
		shellArgs.push(`--allow-run=${allowRunStr}`)
	}
	if (config.denyAllRun) {
		shellArgs.push("--deny-run")
	} else if (config.denyRun) {
		const denyRunStr = config.denyRun.join(",")
		shellArgs.push(`--deny-run=${denyRunStr}`)
	}
	/* ----------------------------------- Ffi ---------------------------------- */
	if (config.allowAllFfi) {
		shellArgs.push("--allow-ffi")
	} else if (config.allowFfi) {
		const allowFfiStr = config.allowFfi.join(",")
		shellArgs.push(`--allow-ffi=${allowFfiStr}`)
	}
	if (config.denyAllFfi) {
		shellArgs.push("--deny-ffi")
	} else if (config.denyFfi) {
		const denyFfiStr = config.denyFfi.join(",")
		shellArgs.push(`--deny-ffi=${denyFfiStr}`)
	}
	/* ----------------------------------- Sys ---------------------------------- */
	if (config.allowAllSys) {
		shellArgs.push("--allow-sys")
	} else if (config.allowSys) {
		const allowSysStr = config.allowSys.join(",")
		shellArgs.push(`--allow-sys=${allowSysStr}`)
	}
	if (config.denyAllSys) {
		shellArgs.push("--deny-sys")
	} else if (config.denySys) {
		const denySysStr = config.denySys.join(",")
		shellArgs.push(`--deny-sys=${denySysStr}`)
	}
	/* ----------------------------------- Script ---------------------------------- */
	scriptPath = await translateScopeToPath(scriptPath, extensionDir)
	shellArgs.push(scriptPath)
	if (args) {
		shellArgs.push(...args)
	}

	return {
		program,
		args: shellArgs,
		options: {
			cwd: config.cwd,
			env: config.env,
			encoding: config.encoding
		}
	}
}
