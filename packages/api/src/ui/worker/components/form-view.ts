import { FormNodeName, FormNodeNameEnum, NodeName } from "../../../models"
import * as FormSchema from "../schema/form"
import type { OmitNodeName } from "./common"
import { type IComponent } from "./interfaces"

export abstract class BaseField implements FormSchema.BaseField, IComponent<FormSchema.BaseField> {
	nodeName: FormNodeName = FormNodeNameEnum.Base
	key: string
	label?: string
	hideLabel?: boolean
	placeholder?: string
	optional?: boolean
	description?: string
	default?: any

	constructor(model: OmitNodeName<FormSchema.BaseField>) {
		this.key = model.key
		this.key = model.key
		this.label = model.label
		this.hideLabel = model.hideLabel
		this.placeholder = model.placeholder
		this.optional = model.optional
		this.description = model.description
		this.default = model.default
	}

	toModel(): FormSchema.BaseField {
		return {
			nodeName: this.nodeName,
			key: this.key,
			label: this.label,
			hideLabel: this.hideLabel,
			placeholder: this.placeholder,
			optional: this.optional,
			description: this.description,
			default: this.default
		}
	}
}

export class InputField
	extends BaseField
	implements FormSchema.InputField, IComponent<FormSchema.InputField>
{
	nodeName: FormNodeName = FormNodeNameEnum.Input
	component?: "textarea" | "default"

	constructor(model: OmitNodeName<FormSchema.InputField>) {
		super(model)
		this.component = model.component
	}

	toModel(): FormSchema.InputField {
		return {
			...super.toModel(),
			component: this.component
		}
	}
}

export class NumberField
	extends BaseField
	implements FormSchema.NumberField, IComponent<FormSchema.NumberField>
{
	nodeName: FormNodeNameEnum.Number = FormNodeNameEnum.Number
}

export class SelectField
	extends BaseField
	implements FormSchema.SelectField, IComponent<FormSchema.SelectField>
{
	nodeName: FormNodeName = FormNodeNameEnum.Select
	options: string[]

	constructor(model: OmitNodeName<FormSchema.SelectField>) {
		super(model)
		this.options = model.options
	}

	toModel(): FormSchema.SelectField {
		return {
			...super.toModel(),
			options: this.options
		}
	}
}

export class BooleanField
	extends BaseField
	implements FormSchema.BooleanField, IComponent<FormSchema.BooleanField>
{
	nodeName: FormNodeName = FormNodeNameEnum.Boolean
	component?: "checkbox" | "switch"

	constructor(model: OmitNodeName<FormSchema.BooleanField>) {
		super(model)
		this.component = model.component ?? "checkbox"
	}

	toModel(): FormSchema.BooleanField {
		return {
			...super.toModel(),
			component: this.component
		}
	}
}

export class DateField
	extends BaseField
	implements FormSchema.DateField, IComponent<FormSchema.DateField>
{
	nodeName: FormNodeName = FormNodeNameEnum.Date
}

export type AllFormFields = InputField | NumberField | SelectField | BooleanField | DateField

export class ArrayField
	extends BaseField
	implements FormSchema.ArrayField, IComponent<FormSchema.ArrayField>
{
	nodeName: FormNodeName = FormNodeNameEnum.Array
	content: AllFormFields

	constructor(model: OmitNodeName<FormSchema.ArrayField & { content: AllFormFields }>) {
		super(model)
		this.content = model.content
	}

	toModel(): FormSchema.ArrayField {
		return {
			...super.toModel(),
			content: this.content.toModel()
		}
	}
}

export class Form implements IComponent<FormSchema.Form> {
	nodeName: FormNodeName = FormNodeNameEnum.Form
	fields: (AllFormFields | Form)[]
	key: string
	title?: string
	description?: string
	submitBtnText?: string

	constructor(model: OmitNodeName<FormSchema.Form & { fields: (AllFormFields | Form)[] }>) {
		this.fields = model.fields
		this.key = model.key
		this.title = model.title
		this.description = model.description
		this.submitBtnText = model.submitBtnText
	}

	toModel(): FormSchema.Form {
		return {
			nodeName: this.nodeName,
			key: this.key,
			title: this.title,
			description: this.description,
			submitBtnText: this.submitBtnText,
			fields: this.fields.map((field) => field.toModel())
		}
	}
}
