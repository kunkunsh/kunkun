import { toast } from "svelte-sonner"
import type {
	GeneralToast,
	GeneralToastParams,
	IDb,
	IFs,
	ISystem,
	IToast,
	IUiIframe,
	IUiWorker
} from "../client"

async function constructToast(
	fn:
		| typeof toast.message
		| typeof toast.info
		| typeof toast.success
		| typeof toast.warning
		| typeof toast.error,
	message: string,
	options?: GeneralToastParams,
	action?: () => void
): Promise<void> {
	await fn(message, {
		...options,
		action:
			action && options?.actionLabel
				? {
						label: options?.actionLabel ?? "Action",
						onClick: () => {
							action()
						}
					}
				: undefined
	})
}

export function constructToastApi(): IToast {
	return {
		message: async (message: string, options?: GeneralToastParams, action?: () => void) => {
			constructToast(toast.message, message, options, action)
		},
		info: async (message: string, options?: GeneralToastParams, action?: () => void) => {
			constructToast(toast.info, message, options, action)
		},
		success: async (message: string, options?: GeneralToastParams, action?: () => void) => {
			constructToast(toast.success, message, options, action)
		},
		warning: async (message: string, options?: GeneralToastParams, action?: () => void) => {
			constructToast(toast.warning, message, options, action)
		},
		error: async (message: string, options?: GeneralToastParams, action?: () => void) => {
			constructToast(toast.error, message, options, action)
		}
	}
}
