import { Icon } from "./icon"

export type OmitNodeName<T> = Omit<T, "nodeName">
export type ReplaceIcon<T> = T & { icon?: Icon }
export type IconConstructorPatch<T> = ReplaceIcon<OmitNodeName<T>>
