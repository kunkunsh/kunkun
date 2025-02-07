import { NodeName, NodeNameEnum } from "../../../models/constants"
import * as ActionSchema from "../schema/action"
import type { IconConstructorPatch, OmitNodeName, ReplaceIcon } from "./common"
import { Icon } from "./icon"
import type { IComponent } from "./interfaces"

export class Action implements ActionSchema.Action, IComponent<ActionSchema.Action> {
	nodeName: NodeName = NodeNameEnum.Action
	icon?: Icon
	title: string
	value: string

	constructor(model: IconConstructorPatch<ActionSchema.Action>) {
		this.icon = model.icon
		this.title = model.title
		this.value = model.value
	}

	toModel(): {
		nodeName: NodeNameEnum
		title: string
		value: string
		icon?: Icon
	} {
		return {
			nodeName: this.nodeName,
			title: this.title,
			value: this.value,
			icon: this.icon
		}
	}
}

// export class ActionPanelSection
//   implements ActionSchema.ActionPanelSection, IComponent<ActionSchema.ActionPanelSection>
// {
//   nodeName: NodeName = NodeNameEnum.ActionPanelSection
//   title: string
//   actions: Action[]

//   constructor(model: OmitNodeName<ActionSchema.ActionPanelSection> & { actions: Action[] }) {
//     this.title = model.title
//     this.actions = model.actions
//   }

//   toModel(): ActionSchema.ActionPanelSection {
//     return {
//       nodeName: this.nodeName,
//       title: this.title,
//       actions: this.actions.map((action) => action.toModel())
//     }
//   }
// }

// export class ActionPanelSubmenu
//   implements ActionSchema.ActionPaneSubmenu, IComponent<ActionSchema.ActionPaneSubmenu>
// {
//   nodeName: NodeName = NodeNameEnum.ActionPanelSubmenu
//   title: string
//   actions: Action[]

//   constructor(model: OmitNodeName<ActionSchema.ActionPaneSubmenu> & { actions: Action[] }) {
//     this.title = model.title
//     this.actions = model.actions
//   }

//   toModel(): ActionSchema.ActionPaneSubmenu {
//     return {
//       nodeName: this.nodeName,
//       title: this.title,
//       actions: this.actions.map((action) => action.toModel())
//     }
//   }
// }

export class ActionPanel implements ActionSchema.ActionPanel, IComponent<ActionSchema.ActionPanel> {
	nodeName: NodeName = NodeNameEnum.ActionPanel
	title?: string
	items: Array<//   ActionPanelSection | ActionPanelSubmenu |
	Action>

	constructor(
		model: OmitNodeName<ActionSchema.ActionPanel> & {
			items: Array<//   ActionPanelSection | ActionPanelSubmenu |
			Action>
		}
	) {
		this.title = model.title
		this.items = model.items
	}

	toModel(): ActionSchema.ActionPanel {
		return {
			nodeName: this.nodeName,
			title: this.title,
			items: this.items.map((item) => item.toModel())
		}
	}
}
