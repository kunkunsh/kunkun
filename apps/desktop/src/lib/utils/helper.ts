/**
 * This file contains APIs for helper
 */
import type { IHelper } from "@kksh/api"
import { goto } from "$app/navigation"

export const helperAPI: IHelper = {
	guideInstallDeno: function (): Promise<void> {
		return goto("/app/help/deno-install")
	},
	guideInstallFfmpeg: function (): Promise<void> {
		return goto("/app/help/ffmpeg-install")
	},
	guideInstallHomebrew: function (): Promise<void> {
		return goto("/app/help/brew-install")
	}
}
