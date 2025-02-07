/**
 * This file contains APIs for helper
 */

import { i18n } from "@/i18n"
import type { IHelper } from "@kksh/api"
import { goto } from "$app/navigation"

export const helperAPI: IHelper = {
	guideInstallDeno: function (): Promise<void> {
		return goto(i18n.resolveRoute("/app/help/deno-install"))
	},
	guideInstallFfmpeg: function (): Promise<void> {
		return goto(i18n.resolveRoute("/app/help/ffmpeg-install"))
	},
	guideInstallHomebrew: function (): Promise<void> {
		return goto(i18n.resolveRoute("/app/help/brew-install"))
	}
}
