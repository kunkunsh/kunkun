import type { AttributifyAttributes } from "@unocss/preset-attributify"

declare module "svelte/elements" {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
	interface HTMLAttributes<T> extends AttributifyAttributes {}
}

export {}
