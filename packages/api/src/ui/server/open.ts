import { exists, stat } from "@tauri-apps/plugin-fs"
import { minimatch } from "minimatch"
import { open } from "tauri-plugin-shellx-api"
import { flatten, parse, pipe, safeParse, string, url, type InferOutput } from "valibot"
import type { OpenPermissionScoped } from "../../permissions"
import {
	combinePathAndBaseDir,
	matchPathAndScope,
	pathStartsWithAlias,
	translateScopeToPath,
	verifyScopedPermission
} from "../../utils/path"
import type { IOpen } from "../client"

const UrlSchema = pipe(string("A URL must be string."), url("The URL is badly formatted."))

export function constructOpenApi(permissions: OpenPermissionScoped[], extDir: string): IOpen {
	return {
		url: async (url: string) => {
			const parseResult = safeParse(UrlSchema, url)
			if (parseResult.success) {
			} else {
				console.error(flatten<typeof UrlSchema>(parseResult.issues))
				throw new Error(`URL is Invalid: ${url}`)
			}
			// permission check
			if (
				await verifyScopedPermission(
					permissions.filter((p) => p.permission === "open:url"),
					parseResult.output,
					"url",
					extDir
				)
			) {
				open(parseResult.output)
			} else {
				throw new Error(
					`Permission denied to open URL: ${parseResult.output}, add "open:url" permission with scope rule to match URL pattern.`
				)
			}
		},
		file: async (path: string) => {
			// check if path is a file and exists
			let p = parse(string(), path)
			if (pathStartsWithAlias(p)) {
				p = await translateScopeToPath(p, extDir)
			}
			console.log("open file path", path)
			if (!(await exists(p))) {
				throw new Error(`File does not exist: ${path}`)
			} else {
				const s = await stat(p)
				if (!s.isFile) {
					throw new Error(`Path is not a file: ${path}`)
				}
			}
			// permission check
			if (
				await verifyScopedPermission(
					permissions.filter((p) => p.permission === "open:file"),
					p,
					"path",
					extDir
				)
			) {
				open(p)
			} else {
				throw new Error(
					`Permission denied to open file: ${path}, add "open:file" permission with scope to match path pattern.`
				)
			}
		},
		folder: async (path: string) => {
			// check if path is a directory and exists
			const p = parse(string(), path)
			if (!(await exists(p))) {
				throw new Error(`Directory does not exist: ${path}`)
			} else {
				const s = await stat(p)
				if (!s.isDirectory) {
					throw new Error(`Path is not a directory: ${path}`)
				}
			}
			if (
				await verifyScopedPermission(
					permissions.filter((p) => p.permission === "open:folder"),
					p,
					"path",
					extDir
				)
			) {
				open(p)
			} else {
				throw new Error(
					`Permission denied to open field: ${path}, add "open:folder" permission with scope to match path pattern.`
				)
			}
		}
	}
}
