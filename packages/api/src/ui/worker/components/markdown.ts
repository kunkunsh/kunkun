import { NodeName, NodeNameEnum } from "../../../models/constants"
import { type Markdown as MarkdownSchema } from "../schema/markdown"
import { type IComponent } from "./interfaces"

export class Markdown implements MarkdownSchema, IComponent<MarkdownSchema> {
	nodeName: NodeName = NodeNameEnum.Markdown
	content: string

	constructor(content: string) {
		this.content = content
	}

	toModel(): MarkdownSchema {
		return {
			nodeName: this.nodeName,
			content: this.content
		}
	}
}
