// import { proxy as comlinkProxy, type Remote } from "@huakunshen/comlink"
import type { GeneralToastParams, IToast } from "../client"

export function constructToastAPI(api: IToast) {
	return {
		message: (message: string, options?: GeneralToastParams, action?: () => void) =>
			api.message(message, options, action ? action : undefined),
		info: (message: string, options?: GeneralToastParams, action?: () => void) =>
			api.info(message, options, action ? action : undefined),
		success: (message: string, options?: GeneralToastParams, action?: () => void) =>
			api.success(message, options, action ? action : undefined),
		warning: (message: string, options?: GeneralToastParams, action?: () => void) =>
			api.warning(message, options, action ? action : undefined),
		error: (message: string, options?: GeneralToastParams, action?: () => void) =>
			api.error(message, options, action ? action : undefined)
	}
}
