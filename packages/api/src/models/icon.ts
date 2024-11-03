import { enum_, literal, object, string, type InferOutput } from "valibot"
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
export const IconType = enum_(IconEnum)
export type IconType = InferOutput<typeof IconType>

export const Icon = object({
	type: IconType,
	value: string()
})
export type Icon = InferOutput<typeof Icon>
export const IconNode = object({
	nodeName: NodeName,
	...Icon.entries
})
export type IconNode = InferOutput<typeof IconNode>
