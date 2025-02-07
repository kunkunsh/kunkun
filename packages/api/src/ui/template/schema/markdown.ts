import { object, string, type InferOutput } from "valibot"
import { NodeName, NodeNameEnum } from "../../../models/constants"

export const Markdown = object({
	nodeName: NodeName,
	content: string()
})
export type Markdown = InferOutput<typeof Markdown>
