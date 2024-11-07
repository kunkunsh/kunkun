import {
	CmdType,
	type CustomUiCmd,
	type ExtPackageJsonExtra,
	type TemplateUiCmd
} from "@kksh/api/models"
import * as v from "valibot"

export type BuiltinCmd = {
	name: string
	description: string
	iconifyIcon: string
	function: () => Promise<void>
}

export type OnExtCmdSelect = (
	ext: ExtPackageJsonExtra,
	cmd: CustomUiCmd | TemplateUiCmd,
	{ isDev, hmr }: { isDev: boolean; hmr: boolean }
) => void

export type CommandLaunchers = {
	onExtCmdSelect: OnExtCmdSelect
}

/**
 * Command Value used in the command search
 */
export const CmdValue = v.object({
	cmdName: v.string(),
	cmdType: CmdType,
	data: v.optional(v.any())
})
export type CmdValue = v.InferOutput<typeof CmdValue>

export type CmdQuery = { name: string; value: string }
