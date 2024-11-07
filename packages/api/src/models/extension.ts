import {
	any,
	array,
	boolean,
	date,
	enum_,
	function_,
	nullable,
	number,
	object,
	optional,
	record,
	string,
	type InferOutput
} from "valibot"
import { Icon } from "./icon"

/**
 * Map window label to extension
 */
export const ExtensionLabelMap = record(
	string("Window label"),
	object({
		path: string("Path to the extension"),
		processes: array(number()),
		dist: optional(nullable(string()))
	})
)
export type ExtensionLabelMap = InferOutput<typeof ExtensionLabelMap>

export const Ext = object({
	extId: number(),
	identifier: string(),
	version: string(),
	enabled: boolean(),
	installed_at: string(),
	path: nullable(string()),
	data: nullable(any())
})
export type Ext = InferOutput<typeof Ext>

export enum CmdTypeEnum {
	HeadlessWorker = "headless_worker",
	Builtin = "builtin",
	System = "system",
	UiWorker = "ui_worker",
	UiIframe = "ui_iframe",
	QuickLink = "quick_link",
	Remote = "remote"
}

export const CmdType = enum_(CmdTypeEnum)
export type CmdType = InferOutput<typeof CmdType>
export const ExtCmd = object({
	cmdId: number(),
	extId: number(),
	name: string(),
	type: CmdType,
	data: string(),
	alias: nullable(optional(string())),
	hotkey: nullable(optional(string())),
	enabled: boolean()
})
export type ExtCmd = InferOutput<typeof ExtCmd>

export const QuickLinkCmd = object({
	...ExtCmd.entries,
	data: object({ link: string(), icon: Icon })
})
export type QuickLinkCmd = InferOutput<typeof QuickLinkCmd>

export const ExtData = object({
	dataId: number(),
	extId: number(),
	dataType: string(),
	data: optional(string()),
	searchText: optional(string()),
	createdAt: date(),
	updatedAt: date()
})
export type ExtData = InferOutput<typeof ExtData>

export const SysCommand = object({
	name: string(),
	value: string(),
	icon: nullable(Icon),
	keywords: nullable(array(string())),
	function: function_(),
	confirmRequired: boolean()
})
export type SysCommand = InferOutput<typeof SysCommand>
