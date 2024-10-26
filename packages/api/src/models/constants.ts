import { enum_, type InferOutput } from "valibot"

export enum NodeNameEnum {
	List = "List",
	ListItem = "ListItem",
	ListItemDetail = "ListItemDetail",
	ListItemAccessory = "ListItemAccessory",
	ListSection = "ListSection",
	ListItemDetailMetadata = "ListItemDetailMetadata",
	ListItemDetailMetadataLabel = "ListItemDetailMetadataLabel",
	ListItemDetailMetadataLink = "ListItemDetailMetadataLink",
	ListItemDetailMetadataTagList = "ListItemDetailMetadataTagList",
	ListItemDetailMetadataTagListItem = "ListItemDetailMetadataTagListItem",
	ListItemDetailMetadataSeparator = "ListItemDetailMetadataSeparator",
	Icon = "Icon",
	EmptyView = "EmptyView",
	Dropdown = "Dropdown",
	DropdownSection = "DropdownSection",
	DropdownItem = "DropdownItem",
	/* --------------------------------- Action --------------------------------- */
	ActionPanel = "ActionPanel",
	Action = "Action",
	ActionPanelSection = "ActionPanelSection",
	ActionPanelSubmenu = "ActionPanelSubmenu",
	/* --------------------------------- Content -------------------------------- */
	Markdown = "Markdown"
}
export const NodeName = enum_(NodeNameEnum)
export type NodeName = InferOutput<typeof NodeName>

export enum FormNodeNameEnum {
	Base = "Base",
	Number = "Number",
	Select = "Select",
	Boolean = "Boolean",
	Input = "Input",
	Date = "Date",
	Array = "Array",
	Form = "Form"
}
export const FormNodeName = enum_(FormNodeNameEnum)
export type FormNodeName = InferOutput<typeof FormNodeName>
