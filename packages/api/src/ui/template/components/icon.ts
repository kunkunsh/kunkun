import { NodeName, NodeNameEnum } from "../../../models/constants"
import type { IconNode, IconType, Icon as TIcon } from "../../../models/icon"
import { type IComponent } from "./interfaces"

export class Icon implements IconNode, IComponent<IconNode> {
	nodeName: NodeName = NodeNameEnum.Icon
	type: IconType
	value: string
	invert?: boolean
	darkInvert?: boolean
	hexColor?: string
	bgColor?: string

	constructor(model: TIcon) {
		this.type = model.type
		this.value = model.value
		this.invert = model.invert
		this.darkInvert = model.darkInvert
		this.hexColor = model.hexColor
		this.bgColor = model.bgColor
	}

	toModel(): IconNode {
		return {
			nodeName: this.nodeName,
			type: this.type,
			value: this.value,
			invert: this.invert,
			darkInvert: this.darkInvert,
			hexColor: this.hexColor,
			bgColor: this.bgColor
		}
	}
}
