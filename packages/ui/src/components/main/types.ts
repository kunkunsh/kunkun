import {
	CmdType,
	Icon,
	type CustomUiCmd,
	type ExtPackageJsonExtra,
	type TemplateUiCmd
} from "@kksh/api/models"
import * as v from "valibot"

export type BuiltinCmd = {
	id: string
	name: string
	description: string
	iconifyIcon: string
	function: () => Promise<void>
	flags?: {
		dev?: boolean // commands only available in dev mode
		developer?: boolean // commands only available in developer mode
	}
}

export type OnExtCmdSelect = (
	ext: ExtPackageJsonExtra,
	cmd: CustomUiCmd | TemplateUiCmd,
	{ isDev, hmr }: { isDev: boolean; hmr: boolean }
) => void

export type CommandLaunchers = {
	onExtCmdSelect: OnExtCmdSelect
	onQuickLinkSelect: (quickLink: CmdValue, queries: CmdQuery[]) => void
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
export type QuickLink = { name: string; link: string; icon: Icon }
