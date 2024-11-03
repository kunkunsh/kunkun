import { CmdTypeEnum, CustomUiCmd, ExtPackageJsonExtra, TemplateUiCmd } from "@kksh/api/models"
import type { CommandLaunchers, OnExtCmdSelect } from "@kksh/types"
import * as v from "valibot"
import { onCustomUiCmdSelect, onTemplateUiCmdSelect } from "./ext"

const onExtCmdSelect: OnExtCmdSelect = (
	ext: ExtPackageJsonExtra,
	cmd: CustomUiCmd | TemplateUiCmd,
	{ isDev, hmr }: { isDev: boolean; hmr: boolean }
) => {
	switch (cmd.type) {
		case CmdTypeEnum.UiIframe:
			onCustomUiCmdSelect(ext, v.parse(CustomUiCmd, cmd), { isDev, hmr })
			break
		case CmdTypeEnum.UiWorker:
			onTemplateUiCmdSelect(ext, v.parse(TemplateUiCmd, cmd), { isDev, hmr })
			break
		default:
			console.error("Unknown command type", cmd.type)
	}
}

export const commandLaunchers = { onExtCmdSelect } satisfies CommandLaunchers
