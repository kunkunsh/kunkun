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
import * as v from "valibot"

export const SystemPermissionSchema = v.union([
	v.literal("system:volumn"),
	v.literal("system:boot"),
	v.literal("system:disk"),
	v.literal("system:apps"),
	v.literal("system:fs"),
	v.literal("system:ui")
])

export const KunkunFsPermissionSchema = v.union([
	FsPermissionSchema,
	v.literal("fs:read-dir"),
	v.literal("fs:stat"),
	v.literal("fs:search")
])
export const EventPermissionSchema = v.union([
	v.literal("event:drag-drop"),
	v.literal("event:drag-enter"),
	v.literal("event:drag-leave"),
	v.literal("event:drag-over"),
	v.literal("event:window-blur"),
	v.literal("event:window-close-requested"),
	v.literal("event:window-focus")
])
export const SecurityPermissionSchema = v.union([
	v.literal("security:mac:reveal-security-pane"),
	v.literal("security:mac:verify-fingerprint"),
	v.literal("security:mac:reset-screencapture-permission"),
	v.literal("security:mac:request-permission"),
	v.literal("security:mac:check-permission"),
	v.literal("security:mac:all")
])
export type SecurityPermission = v.InferOutput<typeof SecurityPermissionSchema>
export type EventPermission = v.InferOutput<typeof EventPermissionSchema>
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
export const DenoSysOptions = v.union([
	v.literal("hostname"),
	v.literal("osRelease"),
	v.literal("osUptime"),
	v.literal("loadavg"),
	v.literal("networkInterfaces"),
	v.literal("systemMemoryInfo"),
	v.literal("uid"),
	v.literal("gid"),
	v.literal("cpus"),
	v.string()
])

export type DenoSysOptions = v.InferOutput<typeof DenoSysOptions>
export const DenoPermissionScopeSchema = v.object({
	/* ------------------------------ Deno Related ------------------------------ */
	// net: optional(array(string())),
	// env: optional(array(string())),
	// read: optional(array(string())),
	// write: optional(array(string())),
	// run: optional(array(string())),
	// ffi: optional(array(string())),
	// sys: optional(array(DenoSysOptions)),
	net: v.optional(v.union([v.literal("*"), v.array(v.string())])),
	env: v.optional(v.union([v.literal("*"), v.array(v.string())])),
	read: v.optional(v.union([v.literal("*"), v.array(v.string())])),
	write: v.optional(v.union([v.literal("*"), v.array(v.string())])),
	run: v.optional(v.union([v.literal("*"), v.array(v.string())])),
	ffi: v.optional(v.union([v.literal("*"), v.array(v.string())])),
	sys: v.optional(v.union([v.literal("*"), v.array(DenoSysOptions)]))
})
export const PermissionScopeSchema = v.object({
	path: v.optional(v.string()),
	url: v.optional(v.string()),
	cmd: v.optional(
		v.object({
			program: v.string(),
			args: v.array(v.string())
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
export type KunkunFsPermission = v.InferOutput<typeof KunkunFsPermissionSchema>
export const FsPermissionScopedSchema = v.object({
	permission: KunkunFsPermissionSchema,
	allow: v.optional(v.array(PermissionScopeSchema)),
	deny: v.optional(v.array(PermissionScopeSchema))
})
export type FsPermissionScoped = v.InferOutput<typeof FsPermissionScopedSchema>

export const OpenPermissionSchema = v.union([
	v.literal("open:url"),
	v.literal("open:file"),
	v.literal("open:folder")
])
export const OpenPermissionScopedSchema = v.object({
	permission: OpenPermissionSchema,
	allow: v.optional(v.array(PermissionScopeSchema)),
	deny: v.optional(v.array(PermissionScopeSchema))
})
export type OpenPermissionScoped = v.InferOutput<typeof OpenPermissionScopedSchema>

export const ShellPermissionSchema = v.union([
	v.literal("shell:execute"),
	v.literal("shell:deno:execute"),
	v.literal("shell:spawn"),
	v.literal("shell:deno:spawn"),
	v.literal("shell:open"),
	v.literal("shell:kill"),
	v.literal("shell:all"),
	v.literal("shell:stdin-write")
])
export const ShellPermissionScopedSchema = v.object({
	permission: ShellPermissionSchema,
	allow: v.optional(v.array(PermissionScopeSchema)),
	deny: v.optional(v.array(PermissionScopeSchema))
})
export type ShellPermissionScoped = v.InferOutput<typeof ShellPermissionScopedSchema>
export type ShellPermission = v.InferOutput<typeof ShellPermissionSchema>

export type SystemPermission = v.InferOutput<typeof SystemPermissionSchema>
export const KunkunManifestPermission = v.union([
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
export const AllKunkunPermission = v.union([
	KunkunManifestPermission,
	KunkunFsPermissionSchema,
	OpenPermissionSchema
])
export type AllKunkunPermission = v.InferOutput<typeof AllKunkunPermission>
