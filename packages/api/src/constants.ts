export enum KUNKUN_EXT_IDENTIFIER {
	KUNKUN_CLIPBOARD_EXT_IDENTIFIER = "sh.kunkun.ext.clipboard",
	KUNKUN_QUICK_LINKS_EXT_IDENTIFIER = "sh.kunkun.ext.quick-links",
	KUNKUN_REMOTE_EXT_IDENTIFIER = "sh.kunkun.ext.remote",
	KUNKUN_SCRIPT_CMD_EXT_IDENTIFIER = "sh.kunkun.ext.script-cmd",
	KUNKUN_DEV_EXT_IDENTIFIER = "sh.kunkun.ext.dev"
}

export const KUNKUN_DESKTOP_APP_SERVER_PORTS = [1566, 1567, 1568, 9559, 9560, 9561]
export const DESKTOP_SERVICE_NAME = "kunkun"

/* -------------------------------------------------------------------------- */
/*                                  Deep Link                                 */
/* -------------------------------------------------------------------------- */
export const DEEP_LINK_PATH_OPEN = "kunkun://open"
export const DEEP_LINK_PATH_STORE = "kunkun://store"
export const DEEP_LINK_PATH_REFRESH_DEV_EXTENSION = "kunkun://refresh-dev-extension"
export const DEEP_LINK_PATH_AUTH_CONFIRM = "kunkun://auth/confirm"
