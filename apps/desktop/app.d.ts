import type { AttributifyAttributes } from "@unocss/preset-attributify"

declare module "svelte/elements" {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface HTMLAttributes<T> extends AttributifyAttributes {}
}

export {}
