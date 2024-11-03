import {
	array,
	boolean,
	date,
	enum_,
	hexColor,
	literal,
	nullable,
	object,
	optional,
	pipe,
	string,
	union,
	type InferOutput
} from "valibot"
import { NodeName, NodeNameEnum } from "../../../models/constants"
import { Icon } from "../../../models/icon"
import { Color } from "../../../models/styles"

export const Action = object({
	nodeName: NodeName,
	icon: optional(Icon),
	title: string(),
	value: string()
	//   shortcut: optional(string())
})
export type Action = InferOutput<typeof Action>

// export const ActionPaneSubmenu = object({
//   nodeName: NodeName,
//   title: string(),
//   actions: array(Action)
// })
// export type ActionPaneSubmenu = InferOutput<typeof ActionPaneSubmenu>

// export const ActionPanelSection = object({
//   nodeName: NodeName,
//   title: string(),
//   actions: array(Action)
// })
// export type ActionPanelSection = InferOutput<typeof ActionPanelSection>

export const ActionPanel = object({
	nodeName: NodeName,
	title: optional(string()),
	items: array(
		union([
			// ActionPanelSection, ActionPaneSubmenu,
			Action
		])
	)
})
export type ActionPanel = InferOutput<typeof ActionPanel>
