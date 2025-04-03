import * as v from "valibot"
import { Icon } from "./icon"

/**
 * Map window label to extension
 */
export const ExtensionLabelMap = v.record(
	v.string("Window label"),
	v.object({
		path: v.string("Path to the extension"),
		processes: v.array(v.number()),
		dist: v.optional(v.nullable(v.string()))
	})
)
export type ExtensionLabelMap = v.InferOutput<typeof ExtensionLabelMap>

export const Ext = v.object({
	extId: v.number(),
	identifier: v.string(),
	version: v.string(),
	enabled: v.boolean(),
	installedAt: v.string(),
	path: v.optional(v.nullable(v.string())),
	data: v.optional(v.any())
})
export type Ext = v.InferOutput<typeof Ext>

export const CmdTypeEnum = {
	HeadlessWorker: "headless_worker",
	Builtin: "builtin",
	System: "system",
	UiWorker: "ui_worker",
	UiIframe: "ui_iframe",
	QuickLink: "quick_link",
	Remote: "remote"
}

export const CmdType = v.picklist(Object.values(CmdTypeEnum))

export type CmdType = v.InferOutput<typeof CmdType>
export const ExtCmd = v.object({
	cmdId: v.number(),
	extId: v.number(),
	name: v.string(),
	type: CmdType,
	data: v.string(),
	alias: v.optional(v.nullable(v.string())),
	hotkey: v.optional(v.nullable(v.string())),
	enabled: v.boolean()
})

export type ExtCmd = v.InferOutput<typeof ExtCmd>

export const QuickLinkCmd = v.object({
	...ExtCmd.entries,
	data: v.object({ link: v.string(), icon: Icon })
})
export type QuickLinkCmd = v.InferOutput<typeof QuickLinkCmd>

export const ExtData = v.object({
	dataId: v.number(),
	extId: v.number(),
	dataType: v.string(),
	data: v.optional(v.string()),
	searchText: v.optional(v.string()),
	createdAt: v.date(),
	updatedAt: v.date()
})
export type ExtData = v.InferOutput<typeof ExtData>

export const SysCommand = v.object({
	name: v.string(),
	value: v.string(),
	icon: v.optional(v.nullable(Icon)),
	keywords: v.optional(v.nullable(v.array(v.string()))),
	function: v.function_(),
	confirmRequired: v.boolean()
})
export type SysCommand = v.InferOutput<typeof SysCommand>
