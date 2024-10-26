import {
	hexColor,
	literal,
	maxValue,
	minValue,
	number,
	object,
	optional,
	pipe,
	string,
	union,
	type InferOutput
} from "valibot"

/* -------------------------------------------------------------------------- */
/*                                    Color                                   */
/* -------------------------------------------------------------------------- */
export const Color = pipe(string(), hexColor())
export type Color = InferOutput<typeof Color>
/* -------------------------------------------------------------------------- */
/*                                    Style                                   */
/* -------------------------------------------------------------------------- */
export const CustomPosition = object({
	top: optional(number()),
	right: optional(number()),
	bottom: optional(number()),
	left: optional(number())
})
export type CustomPosition = InferOutput<typeof CustomPosition>
export type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | CustomPosition
export const LightMode = union([literal("light"), literal("dark"), literal("auto")])
export type LightMode = InferOutput<typeof LightMode>
export const ThemeColor = union([
	literal("zinc"),
	literal("slate"),
	literal("stone"),
	literal("gray"),
	literal("neutral"),
	literal("red"),
	literal("rose"),
	literal("orange"),
	literal("green"),
	literal("blue"),
	literal("yellow"),
	literal("violet")
])
export type ThemeColor = InferOutput<typeof ThemeColor>
export const Radius = pipe(number(), minValue(0), maxValue(1))
export type Radius = InferOutput<typeof Radius>
