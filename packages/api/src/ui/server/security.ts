import { Command, open } from "tauri-plugin-shellx-api"
import * as v from "valibot"
import { macSecurity } from "../../commands"
import { SecurityPermissionMap, type SecurityPermission } from "../../permissions"
import { checkPermission } from "../../utils/permission-check"
import { MacSecurityOptions, type ISecurity } from "../client"

export function constructSecurityAPI(permissions: SecurityPermission[]): ISecurity {
	return {
		mac: {
			revealSecurityPane: (privacyOption?: MacSecurityOptions) => {
				checkPermission<SecurityPermission>(
					permissions,
					SecurityPermissionMap.mac.revealSecurityPane
				)
				if (privacyOption) {
					const parsedOption = v.parse(MacSecurityOptions, privacyOption)
					return open(
						`x-apple.systempreferences:com.apple.preference.security?Privacy_${parsedOption}`
					)
				} else {
					return open("x-apple.systempreferences:com.apple.preference.security")
				}
			},
			verifyFingerprint: async () => {
				return macSecurity.verifyAuth()
			},
			requestScreenCapturePermission: async () => {
				checkPermission<SecurityPermission>(
					permissions,
					SecurityPermissionMap.mac.requestScreenCapturePermission
				)
				return macSecurity.requestScreenCaptureAccess()
			},
			checkScreenCapturePermission: async () => {
				checkPermission<SecurityPermission>(
					permissions,
					SecurityPermissionMap.mac.checkScreenCapturePermission
				)
				return macSecurity.checkScreenCaptureAccess()
			},
			resetPermission: (privacyOption: MacSecurityOptions) => {
				const parsedOption = v.parse(MacSecurityOptions, privacyOption)
				const cmd = Command.create("tccutil", ["reset", parsedOption, "sh.kunkun.desktop"])
				return cmd.execute().then((res) => {
					if (res.code !== 0) {
						throw new Error(`Failed to reset permission: ${res.stderr}`)
					}
				})
			}
		}
	}
}
