import type { FormNodeName, NodeName } from "../../../models/constants"

export interface IComponent<T> {
	nodeName: NodeName | FormNodeName
	toModel(): T
}
