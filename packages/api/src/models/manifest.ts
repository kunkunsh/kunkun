import { FsPermissionSchema } from "tauri-api-adapter/permissions"
import {
	array,
	boolean,
	enum_,
	literal,
	nullable,
	number,
	object,
	optional,
	string,
	union,
	type InferOutput
} from "valibot"
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

export const OSPlatform = enum_(OSPlatformEnum)
export type OSPlatform = InferOutput<typeof OSPlatform>
const allPlatforms = Object.values(OSPlatformEnum)
export const TriggerCmd = object({
	type: union([literal("text"), literal("regex")]),
	value: string()
})
export type TriggerCmd = InferOutput<typeof TriggerCmd>
export enum TitleBarStyleEnum {
	"visible" = "visible",
	"transparent" = "transparent",
	"overlay" = "overlay"
}
export const TitleBarStyle = enum_(TitleBarStyleEnum)
// JS new WebViewWindow only accepts lowercase, while manifest loaded from Rust is capitalized. I run toLowerCase() on the value before passing it to the WebViewWindow.
// This lowercase title bar style schema is used to validate and set the type so TypeScript won't complaint
// export const TitleBarStyleAllLower = z.enum(["visible", "transparent", "overlay"]);
// export type TitleBarStyleAllLower = z.infer<typeof TitleBarStyleAllLower>;
export const WindowConfig = object({
	center: optional(nullable(boolean())),
	x: optional(nullable(number())),
	y: optional(nullable(number())),
	width: optional(nullable(number())),
	height: optional(nullable(number())),
	minWidth: optional(nullable(number())),
	minHeight: optional(nullable(number())),
	maxWidth: optional(nullable(number())),
	maxHeight: optional(nullable(number())),
	resizable: optional(nullable(boolean())),
	title: optional(nullable(string())),
	fullscreen: optional(nullable(boolean())),
	focus: optional(nullable(boolean())),
	transparent: optional(nullable(boolean())),
	maximized: optional(nullable(boolean())),
	visible: optional(nullable(boolean())),
	decorations: optional(nullable(boolean())),
	alwaysOnTop: optional(nullable(boolean())),
	alwaysOnBottom: optional(nullable(boolean())),
	contentProtected: optional(nullable(boolean())),
	skipTaskbar: optional(nullable(boolean())),
	shadow: optional(nullable(boolean())),
	// theme: optional(nullable(union([literal("light"), literal("dark")]))), // changing theme of one window will change theme of all windows
	titleBarStyle: optional(nullable(TitleBarStyle)),
	hiddenTitle: optional(nullable(boolean())),
	tabbingIdentifier: optional(nullable(string())),
	maximizable: optional(nullable(boolean())),
	minimizable: optional(nullable(boolean())),
	closable: optional(nullable(boolean())),
	parent: optional(nullable(string())),
	visibleOnAllWorkspaces: optional(nullable(boolean()))
})
export type WindowConfig = InferOutput<typeof WindowConfig>
export const CustomUiCmd = object({
	type: optional(CmdType, CmdType.enum.UiIframe),
	main: string("HTML file to load, e.g. dist/index.html"),
	dist: string("Dist folder to load, e.g. dist, build, out"),
	description: optional(nullable(string("Description of the Command"), ""), ""),
	devMain: string("URL to load in development to support live reload, e.g. http://localhost:5173/"),
	name: string("Name of the command"),
	window: optional(nullable(WindowConfig)),
	cmds: array(TriggerCmd, "Commands to trigger the UI"),
	icon: optional(Icon),
	platforms: optional(
		nullable(
			array(OSPlatform, "Platforms available on. Leave empty for all platforms."),
			allPlatforms
		),
		allPlatforms
	)
})
export type CustomUiCmd = InferOutput<typeof CustomUiCmd>

export const TemplateUiCmd = object({
	type: optional(CmdType, CmdType.enum.UiWorker),
	main: string(),
	name: string(),
	description: optional(nullable(string("Description of the Command"), ""), ""),
	window: optional(nullable(WindowConfig)),
	cmds: array(TriggerCmd),
	icon: optional(Icon),
	platforms: optional(
		nullable(
			array(OSPlatform, "Platforms available on. Leave empty for all platforms."),
			allPlatforms
		),
		allPlatforms
	)
})
export type TemplateUiCmd = InferOutput<typeof TemplateUiCmd>
export const PermissionUnion = union([
	// KunkunManifestPermission,
	FsPermissionScopedSchema,
	OpenPermissionScopedSchema,
	ShellPermissionScopedSchema
])
export type PermissionUnion = InferOutput<typeof PermissionUnion>
export const KunkunExtManifest = object({
	name: string("Name of the extension (Human Readable)"),
	shortDescription: string("Description of the extension (Will be displayed in store)"),
	longDescription: string("Long description of the extension (Will be displayed in store)"),
	identifier: string(
		"Unique identifier for the extension, must be the same as extension folder name"
	),
	icon: Icon,
	permissions: array(
		PermissionUnion,
		"Permissions Declared by the extension. e.g. clipboard-all. Not declared APIs will be blocked."
	),
	demoImages: array(string("Demo images for the extension")),
	customUiCmds: array(CustomUiCmd, "Custom UI Commands"),
	templateUiCmds: array(TemplateUiCmd, "Template UI Commands")
})
export type KunkunExtManifest = InferOutput<typeof KunkunExtManifest>

const Person = union([
	object({
		name: string("GitHub Username"),
		email: string("Email of the person"),
		url: optional(nullable(string("URL of the person")))
	}),
	string("GitHub Username")
])

export const ExtPackageJson = object({
	name: string("Package name for the extension (just a regular npm package name)"),
	version: string("Version of the extension"),
	author: optional(Person),
	draft: optional(boolean("Whether the extension is a draft, draft will not be published")),
	contributors: optional(array(Person, "Contributors of the extension")),
	repository: optional(
		union([
			string("URL of the repository"),
			object({
				type: string("Type of the repository"),
				url: string("URL of the repository"),
				directory: string("Directory of the repository")
			})
		])
	),
	kunkun: KunkunExtManifest,
	files: array(string("Files to include in the extension. e.g. ['dist']"))
})
export type ExtPackageJson = InferOutput<typeof ExtPackageJson>
/**
 * Extra fields for ExtPackageJson
 * e.g. path to the extension
 */
export const ExtPackageJsonExtra = object({
	...ExtPackageJson.entries,
	...{
		extPath: string(),
		extFolderName: string()
	}
})

export type ExtPackageJsonExtra = InferOutput<typeof ExtPackageJsonExtra>
