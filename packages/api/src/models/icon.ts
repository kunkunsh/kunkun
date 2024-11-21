import * as v from "valibot"
import { NodeName, NodeNameEnum } from "./constants"

/* -------------------------------------------------------------------------- */
/*                                    Icon                                    */
/* -------------------------------------------------------------------------- */
export enum IconEnum {
	Iconify = "iconify",
	RemoteUrl = "remote-url",
	Svg = "svg",
	Base64PNG = "base64-png",
	Text = "text"
}
export const IconType = v.enum_(IconEnum)
export type IconType = v.InferOutput<typeof IconType>

export type Icon = {
	type: IconType
	value: string
	invert?: boolean
	darkInvert?: boolean
	hexColor?: string
	bgColor?: string
	fallback?: Icon
}

export const BaseIcon = v.object({
	type: IconType,
	value: v.string(),
	invert: v.optional(v.boolean()),
	darkInvert: v.optional(v.boolean()),
	hexColor: v.optional(v.string()),
	bgColor: v.optional(v.string())
	// hexColor: v.optional(v.pipe(v.string(), v.hexColor("The hex color is badly formatted."))),
	// bgColor: v.optional(v.pipe(v.string(), v.hexColor("The hex color is badly formatted.")))
})

export const Icon: v.GenericSchema<Icon> = v.object({
	...BaseIcon.entries,
	fallback: v.optional(v.lazy(() => Icon))
})

export const IconNode = v.object({
	...BaseIcon.entries,
	nodeName: NodeName,
	fallback: v.optional(v.lazy(() => Icon))
})

export type IconNode = v.InferOutput<typeof IconNode>
