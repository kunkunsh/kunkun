import { proxy as comlinkProxy, type Remote } from "@huakunshen/comlink"
import type { GeneralToastParams, IToast } from "../client"

export function constructToastAPI(api: Remote<IToast>) {
	return {
		message: (message: string, options?: GeneralToastParams, action?: () => void) =>
			api.message(message, options, action ? comlinkProxy(action) : undefined),
		info: (message: string, options?: GeneralToastParams, action?: () => void) =>
			api.info(message, options, action ? comlinkProxy(action) : undefined),
		success: (message: string, options?: GeneralToastParams, action?: () => void) =>
			api.success(message, options, action ? comlinkProxy(action) : undefined),
		warning: (message: string, options?: GeneralToastParams, action?: () => void) =>
			api.warning(message, options, action ? comlinkProxy(action) : undefined),
		error: (message: string, options?: GeneralToastParams, action?: () => void) =>
			api.error(message, options, action ? comlinkProxy(action) : undefined)
	}
}
