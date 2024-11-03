import type { CustomUiCmd, ExtPackageJsonExtra, TemplateUiCmd } from "@kksh/api/models"

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
