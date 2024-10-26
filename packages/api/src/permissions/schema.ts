import {
	ClipboardPermissionSchema,
	DialogPermissionSchema,
	FetchPermissionSchema,
	FsPermissionSchema,
	NetworkPermissionSchema,
	NotificationPermissionSchema,
	OsPermissionSchema,
	// ShellPermissionSchema,
	SystemInfoPermissionSchema,
	// AllPermissionSchema as TauriApiAdapterAllPermissionSchema,
	UpdownloadPermissionSchema
} from "tauri-api-adapter/permissions"
import { array, literal, object, optional, string, union, type InferOutput } from "valibot"

export const SystemPermissionSchema = union([
	literal("system:volumn"),
	literal("system:boot"),
	literal("system:disk"),
	literal("system:apps"),
	literal("system:fs"),
	literal("system:ui")
])
export const KunkunFsPermissionSchema = union([
	FsPermissionSchema,
	literal("fs:read-dir"),
	literal("fs:stat"),
	literal("fs:search")
])
export const EventPermissionSchema = union([
	literal("event:drag-drop"),
	literal("event:drag-enter"),
	literal("event:drag-leave"),
	literal("event:drag-over"),
	literal("event:window-blur"),
	literal("event:window-close-requested"),
	literal("event:window-focus")
])
export const SecurityPermissionSchema = union([
	literal("security:mac:reveal-security-pane"),
	literal("security:mac:verify-fingerprint"),
	literal("security:mac:reset-screencapture-permission"),
	literal("security:mac:request-permission"),
	literal("security:mac:check-permission"),
	literal("security:mac:all")
])
export type SecurityPermission = InferOutput<typeof SecurityPermissionSchema>
export type EventPermission = InferOutput<typeof EventPermissionSchema>
// export const DenoRuntimePermissionSchema = union([
// 	literal("deno:net"),
// 	literal("deno:env"),
// 	literal("deno:read"),
// 	literal("deno:write"),
// 	literal("deno:run"),
// 	literal("deno:ffi"),
// 	literal("deno:sys")
// ])
// export type DenoRuntimePermission = InferOutput<typeof DenoRuntimePermissionSchema>
export const DenoSysOptions = union([
	literal("hostname"),
	literal("osRelease"),
	literal("osUptime"),
	literal("loadavg"),
	literal("networkInterfaces"),
	literal("systemMemoryInfo"),
	literal("uid"),
	literal("gid")
])

export type DenoSysOptions = InferOutput<typeof DenoSysOptions>
export const DenoPermissionScopeSchema = object({
	/* ------------------------------ Deno Related ------------------------------ */
	// net: optional(array(string())),
	// env: optional(array(string())),
	// read: optional(array(string())),
	// write: optional(array(string())),
	// run: optional(array(string())),
	// ffi: optional(array(string())),
	// sys: optional(array(DenoSysOptions)),
	net: optional(union([literal("*"), array(string())])),
	env: optional(union([literal("*"), array(string())])),
	read: optional(union([literal("*"), array(string())])),
	write: optional(union([literal("*"), array(string())])),
	run: optional(union([literal("*"), array(string())])),
	ffi: optional(union([literal("*"), array(string())])),
	sys: optional(union([literal("*"), array(DenoSysOptions)]))
})
export const PermissionScopeSchema = object({
	path: optional(string()),
	url: optional(string()),
	cmd: optional(
		object({
			program: string(),
			args: array(string())
		})
	),
	...DenoPermissionScopeSchema.entries
})

// export const DenoPermissionScopedSchema = object({
// 	permission: DenoRuntimePermissionSchema,
// 	allow: optional(array(PermissionScopeSchema)),
// 	deny: optional(array(PermissionScopeSchema))
// })
// export type DenoPermissionScoped = InferOutput<typeof DenoPermissionScopedSchema>
export type KunkunFsPermission = InferOutput<typeof KunkunFsPermissionSchema>
export const FsPermissionScopedSchema = object({
	permission: KunkunFsPermissionSchema,
	allow: optional(array(PermissionScopeSchema)),
	deny: optional(array(PermissionScopeSchema))
})
export type FsPermissionScoped = InferOutput<typeof FsPermissionScopedSchema>

export const OpenPermissionSchema = union([
	literal("open:url"),
	literal("open:file"),
	literal("open:folder")
])
export const OpenPermissionScopedSchema = object({
	permission: OpenPermissionSchema,
	allow: optional(array(PermissionScopeSchema)),
	deny: optional(array(PermissionScopeSchema))
})
export type OpenPermissionScoped = InferOutput<typeof OpenPermissionScopedSchema>

export const ShellPermissionSchema = union([
	literal("shell:execute"),
	literal("shell:deno:execute"),
	literal("shell:spawn"),
	literal("shell:deno:spawn"),
	literal("shell:open"),
	literal("shell:kill"),
	literal("shell:all"),
	literal("shell:stdin-write")
])
export const ShellPermissionScopedSchema = object({
	permission: ShellPermissionSchema,
	allow: optional(array(PermissionScopeSchema)),
	deny: optional(array(PermissionScopeSchema))
})
export type ShellPermissionScoped = InferOutput<typeof ShellPermissionScopedSchema>
export type ShellPermission = InferOutput<typeof ShellPermissionSchema>

export type SystemPermission = InferOutput<typeof SystemPermissionSchema>
export const KunkunManifestPermission = union([
	// TauriApiAdapterAllPermissionSchema,
	ClipboardPermissionSchema,
	EventPermissionSchema,
	DialogPermissionSchema,
	NotificationPermissionSchema,
	// FsPermissionSchema,
	OsPermissionSchema,
	ShellPermissionSchema,
	// StringShellPermissionSchema, // permission like exeucte and spawn must be scoped, this schema should only contain string permissions
	FetchPermissionSchema,
	SystemInfoPermissionSchema,
	NetworkPermissionSchema,
	UpdownloadPermissionSchema,
	SystemPermissionSchema,
	SecurityPermissionSchema
	// FsScopePermissionSchema
])
export const AllKunkunPermission = union([
	KunkunManifestPermission,
	KunkunFsPermissionSchema,
	OpenPermissionSchema
])
export type AllKunkunPermission = InferOutput<typeof AllKunkunPermission>
