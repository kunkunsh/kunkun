import { BaseDirectory } from "@tauri-apps/api/path"
import {
	copyFile as fsCopyFile,
	create as fsCreate,
	exists as fsExists,
	lstat as fsLstat,
	mkdir as fsMkdir,
	readDir as fsReadDir,
	readFile as fsReadFile,
	readTextFile as fsReadTextFile,
	remove as fsRemove,
	rename as fsRename,
	stat as fsStat,
	truncate as fsTruncate,
	writeFile as fsWriteFile,
	writeTextFile as fsWriteTextFile,
	type CopyFileOptions,
	type CreateOptions,
	type ExistsOptions,
	type MkdirOptions,
	type ReadDirOptions,
	type ReadFileOptions,
	type RemoveOptions,
	type RenameOptions,
	type StatOptions,
	type TruncateOptions,
	type WriteFileOptions
} from "@tauri-apps/plugin-fs"
import { fileSearch, FileSearchParams } from "../../commands/fileSearch"
import { FsPermissionMap } from "../../permissions/permission-map"
import {
	AllKunkunPermission,
	type FsPermissionScoped,
	type KunkunFsPermission,
	type SystemPermission
} from "../../permissions/schema"
import {
	combinePathAndBaseDir,
	matchPathAndScope,
	verifyGeneralPathScopedPermission
} from "../../utils/path"
import type { IFs } from "../client"

/**
 * `tauri-api-adapter` provides fs API
 * In Kunkun I provide a more granular permission system and an extra file search API, so I rewrite the fs server API constructor
 * @param permissions
 * @returns
 */
export function constructFsApi(permissions: FsPermissionScoped[], extensionDir: string): IFs {
	/**
	 * This is a helper function to simplify the creation of methods that takes one path and one options object
	 * @param requiredPermissions
	 * @param fn
	 * @returns
	 */
	const createMethod = <T extends (...args: any[]) => Promise<any>>(
		requiredPermissions: KunkunFsPermission[],
		fn: T
	) => {
		return (path: string | URL, options?: { baseDir?: BaseDirectory }): ReturnType<T> =>
			verifyGeneralPathScopedPermission(
				requiredPermissions,
				permissions,
				path,
				extensionDir,
				options
			).then((result) => fn(path, options)) as ReturnType<T>
	}
	return {
		readDir: createMethod(FsPermissionMap.readDir, fsReadDir),
		readFile: createMethod(FsPermissionMap.readFile, fsReadFile),
		readTextFile: createMethod(FsPermissionMap.readTextFile, fsReadTextFile),
		stat: createMethod(FsPermissionMap.stat, fsStat),
		lstat: createMethod(FsPermissionMap.lstat, fsLstat),
		exists: createMethod(FsPermissionMap.exists, fsExists),
		mkdir: createMethod(FsPermissionMap.mkdir, fsMkdir),
		create: createMethod(FsPermissionMap.create, fsCreate),
		copyFile: (fromPath: string | URL, toPath: string | URL, options?: CopyFileOptions) => {
			return fsStat(fromPath)
				.then((oldPathStat) => {
					const oldPathPermissions: KunkunFsPermission[] = ["fs:read"]
					if (oldPathStat.isDirectory) {
						oldPathPermissions.push("fs:read-dir")
					}
					return Promise.all([
						verifyGeneralPathScopedPermission(
							oldPathPermissions,
							permissions,
							fromPath,
							extensionDir,
							{
								baseDir: options?.fromPathBaseDir
							}
						),
						verifyGeneralPathScopedPermission(["fs:write"], permissions, toPath, extensionDir, {
							baseDir: options?.toPathBaseDir
						})
					])
				})
				.then(() => fsCopyFile(fromPath, toPath, options))
		},
		remove: createMethod(FsPermissionMap.remove, fsRemove),
		rename: async (oldPath: string | URL, newPath: string | URL, options?: RenameOptions) => {
			return fsStat(oldPath)
				.then((oldPathStat) => {
					const oldPathPermissions: KunkunFsPermission[] = ["fs:read"]
					if (oldPathStat.isDirectory) {
						oldPathPermissions.push("fs:read-dir")
					}
					return Promise.all([
						verifyGeneralPathScopedPermission(
							oldPathPermissions,
							permissions,
							oldPath,
							extensionDir,
							{
								baseDir: options?.oldPathBaseDir
							}
						),
						verifyGeneralPathScopedPermission(["fs:write"], permissions, newPath, extensionDir, {
							baseDir: options?.oldPathBaseDir
						})
					])
				})
				.then(() => fsRename(oldPath, newPath, options))
		},
		truncate: (path: string | URL, len?: number, options?: TruncateOptions) =>
			verifyGeneralPathScopedPermission(
				FsPermissionMap.truncate,
				permissions,
				path,
				extensionDir,
				options
			).then(() => fsTruncate(path, len, options)),
		writeFile: (path: string | URL, data: Uint8Array, options?: WriteFileOptions) =>
			verifyGeneralPathScopedPermission(
				FsPermissionMap.truncate,
				permissions,
				path,
				extensionDir,
				options
			).then(() => fsWriteFile(path, data, options)),
		writeTextFile: (path: string | URL, data: string, options?: WriteFileOptions) =>
			verifyGeneralPathScopedPermission(
				FsPermissionMap.truncate,
				permissions,
				path,
				extensionDir,
				options
			).then(() => fsWriteTextFile(path, data, options)),
		fileSearch: (
			searchParams: Omit<FileSearchParams, "hidden" | "ignore_case"> & {
				hidden?: boolean
				ignore_case?: boolean
			}
		) => {
			return Promise.all(
				// TODO: first verify all search locations are allowed, for now, recursive search is allowed even if scope allows one level only
				searchParams.locations.map((loc) =>
					verifyGeneralPathScopedPermission(
						FsPermissionMap.fileSearch,
						permissions,
						loc,
						extensionDir
					)
				)
			).then(() => fileSearch(searchParams))
		}
	}
}
