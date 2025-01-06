import { FsPermissionSchema } from "tauri-api-adapter/permissions"
import * as v from "valibot"
import {
	AllKunkunPermission,
	FsPermissionScopedSchema,
	KunkunFsPermissionSchema,
	KunkunManifestPermission,
	OpenPermissionScopedSchema,
	ShellPermissionScopedSchema
} from "../permissions"
import { CmdType } from "./extension"
import { Icon } from "./icon"

export enum OSPlatformEnum {
	linux = "linux",
	macos = "macos",
	windows = "windows"
}

export const OSPlatform = v.enum_(OSPlatformEnum)
export type OSPlatform = v.InferOutput<typeof OSPlatform>
const allPlatforms = Object.values(OSPlatformEnum)
export const TriggerCmd = v.object({
	type: v.union([v.literal("text"), v.literal("regex")]),
	value: v.string()
})
export type TriggerCmd = v.InferOutput<typeof TriggerCmd>
export enum TitleBarStyleEnum {
	"visible" = "visible",
	"transparent" = "transparent",
	"overlay" = "overlay"
}
export const TitleBarStyle = v.enum_(TitleBarStyleEnum)
// JS new WebViewWindow only accepts lowercase, while manifest loaded from Rust is capitalized. I run toLowerCase() on the value before passing it to the WebViewWindow.
// This lowercase title bar style schema is used to validate and set the type so TypeScript won't complaint
// export const TitleBarStyleAllLower = z.enum(["visible", "transparent", "overlay"]);
// export type TitleBarStyleAllLower = z.infer<typeof TitleBarStyleAllLower>;
export const WindowConfig = v.object({
	center: v.optional(v.nullable(v.boolean())),
	x: v.optional(v.nullable(v.number())),
	y: v.optional(v.nullable(v.number())),
	width: v.optional(v.nullable(v.number())),
	height: v.optional(v.nullable(v.number())),
	minWidth: v.optional(v.nullable(v.number())),
	minHeight: v.optional(v.nullable(v.number())),
	maxWidth: v.optional(v.nullable(v.number())),
	maxHeight: v.optional(v.nullable(v.number())),
	resizable: v.optional(v.nullable(v.boolean())),
	title: v.optional(v.nullable(v.string())),
	fullscreen: v.optional(v.nullable(v.boolean())),
	focus: v.optional(v.nullable(v.boolean())),
	transparent: v.optional(v.nullable(v.boolean())),
	maximized: v.optional(v.nullable(v.boolean())),
	visible: v.optional(v.nullable(v.boolean())),
	decorations: v.optional(v.nullable(v.boolean())),
	alwaysOnTop: v.optional(v.nullable(v.boolean())),
	alwaysOnBottom: v.optional(v.nullable(v.boolean())),
	contentProtected: v.optional(v.nullable(v.boolean())),
	skipTaskbar: v.optional(v.nullable(v.boolean())),
	shadow: v.optional(v.nullable(v.boolean())),
	// theme: optional(nullable(union([literal("light"), literal("dark")]))), // changing theme of one window will change theme of all windows
	titleBarStyle: v.optional(v.nullable(TitleBarStyle)),
	hiddenTitle: v.optional(v.nullable(v.boolean())),
	tabbingIdentifier: v.optional(v.nullable(v.string())),
	maximizable: v.optional(v.nullable(v.boolean())),
	minimizable: v.optional(v.nullable(v.boolean())),
	closable: v.optional(v.nullable(v.boolean())),
	parent: v.optional(v.nullable(v.string())),
	visibleOnAllWorkspaces: v.optional(v.nullable(v.boolean()))
})
export type WindowConfig = v.InferOutput<typeof WindowConfig>
export const BaseCmd = v.object({
	main: v.string("HTML file to load, e.g. dist/index.html"),
	description: v.optional(v.nullable(v.string("Description of the Command"), ""), ""),
	name: v.string("Name of the command"),
	cmds: v.array(TriggerCmd, "Commands to trigger the UI"),
	icon: v.optional(Icon),
	platforms: v.optional(
		v.nullable(
			v.array(OSPlatform, "Platforms available on. Leave empty for all platforms."),
			allPlatforms
		),
		allPlatforms
	)
})
export const CustomUiCmd = v.object({
	...BaseCmd.entries,
	type: v.optional(CmdType, CmdType.enum.UiIframe),
	dist: v.string("Dist folder to load, e.g. dist, build, out"),
	devMain: v.string(
		"URL to load in development to support live reload, e.g. http://localhost:5173/"
	),
	window: v.optional(v.nullable(WindowConfig))
})
export type CustomUiCmd = v.InferOutput<typeof CustomUiCmd>

export const TemplateUiCmd = v.object({
	...BaseCmd.entries,
	type: v.optional(CmdType, CmdType.enum.UiWorker),
	window: v.optional(v.nullable(WindowConfig))
})
export const HeadlessCmd = v.object({
	...BaseCmd.entries,
	type: v.optional(CmdType, CmdType.enum.HeadlessWorker)
})
export type HeadlessCmd = v.InferOutput<typeof HeadlessCmd>
export type TemplateUiCmd = v.InferOutput<typeof TemplateUiCmd>
export const PermissionUnion = v.union([
	KunkunManifestPermission,
	FsPermissionScopedSchema,
	OpenPermissionScopedSchema,
	ShellPermissionScopedSchema
])
export type PermissionUnion = v.InferOutput<typeof PermissionUnion>
export const KunkunExtManifest = v.object({
	name: v.string("Name of the extension (Human Readable)"),
	shortDescription: v.string("Description of the extension (Will be displayed in store)"),
	longDescription: v.string("Long description of the extension (Will be displayed in store)"),
	identifier: v.string(
		"Unique identifier for the extension, must be the same as extension folder name"
	),
	icon: Icon,
	permissions: v.array(
		PermissionUnion,
		"Permissions Declared by the extension. e.g. clipboard-all. Not declared APIs will be blocked."
	),
	demoImages: v.array(v.string("Demo images for the extension")),
	customUiCmds: v.optional(v.array(CustomUiCmd, "Custom UI Commands")),
	templateUiCmds: v.optional(v.array(TemplateUiCmd, "Template UI Commands")),
	headlessCmds: v.optional(v.array(HeadlessCmd, "Headless Commands"))
})
export type KunkunExtManifest = v.InferOutput<typeof KunkunExtManifest>

const Person = v.union([
	v.object({
		name: v.string("GitHub Username"),
		email: v.string("Email of the person"),
		url: v.optional(v.nullable(v.string("URL of the person")))
	}),
	v.string("GitHub Username")
])

export const ExtPackageJson = v.object({
	name: v.string("Package name for the extension (just a regular npm package name)"),
	version: v.string("Version of the extension"),
	author: v.optional(Person),
	draft: v.optional(v.boolean("Whether the extension is a draft, draft will not be published")),
	contributors: v.optional(v.array(Person, "Contributors of the extension")),
	repository: v.optional(
		v.union([
			v.string("URL of the repository"),
			v.object({
				type: v.string("Type of the repository"),
				url: v.string("URL of the repository"),
				directory: v.string("Directory of the repository")
			})
		])
	),
	kunkun: KunkunExtManifest,
	files: v.array(v.string("Files to include in the extension. e.g. ['dist']"))
})
export type ExtPackageJson = v.InferOutput<typeof ExtPackageJson>
/**
 * Extra fields for ExtPackageJson
 * e.g. path to the extension
 */
export const ExtPackageJsonExtra = v.object({
	...ExtPackageJson.entries,
	...{
		extPath: v.string(),
		extFolderName: v.string()
	}
})

export type ExtPackageJsonExtra = v.InferOutput<typeof ExtPackageJsonExtra>
