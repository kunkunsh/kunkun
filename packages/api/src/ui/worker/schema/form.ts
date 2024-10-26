import {
	any,
	array,
	boolean,
	lazy,
	literal,
	number,
	object,
	optional,
	parse,
	required,
	string,
	union,
	type GenericSchema,
	type InferOutput
} from "valibot"
import { FormNodeName, FormNodeNameEnum } from "../../../models/constants"

// boolean (checkbox, switch)
// date (date picker)
// enum (select, radio group)
// number (input)
// string (input, textfield)
// file (file)

// This is only for string inputs (types that outputs string)
export const InputTypes = union([
	literal("color"),
	literal("date"),
	literal("datetime-local"),
	literal("month"),
	literal("number"),
	literal("password"),
	literal("text"),
	literal("url"),
	literal("week"),
	literal("time"),
	literal("search")
])
export type InputTypes = InferOutput<typeof InputTypes>
// export const InputProps = object({
// 	placeholder: optional(string()),
// 	// defaultValue: optional(string()),
// 	// these types can be properly rendered and output a string
// 	type: optional(InputTypes),
// 	showLabel: optional(boolean()),
// 	required: optional(boolean())
// })

export const BaseField = object({
	nodeName: FormNodeName,
	key: string(),
	label: optional(string()),
	hideLabel: optional(boolean()),
	placeholder: optional(string()),
	optional: optional(boolean()),
	description: optional(string()),
	default: optional(any())
})
export type BaseField = InferOutput<typeof BaseField>

/* -------------------------------------------------------------------------- */
/*                                Input Element                               */
/* -------------------------------------------------------------------------- */
export const InputField = object({
	...BaseField.entries,
	type: optional(InputTypes),
	component: optional(union([literal("textarea"), literal("default")]))
})
export type InputField = InferOutput<typeof InputField>

/* -------------------------------------------------------------------------- */
/*                                   Number                                   */
/* -------------------------------------------------------------------------- */
export const NumberField = object({
	...BaseField.entries,
	nodeName: FormNodeName
})
export type NumberField = InferOutput<typeof NumberField>

/* -------------------------------------------------------------------------- */
/*                                   Select                                   */
/* -------------------------------------------------------------------------- */
// with zod enum
export const SelectField = object({
	...BaseField.entries,
	options: array(string())
})
export type SelectField = InferOutput<typeof SelectField>

/* -------------------------------------------------------------------------- */
/*                                   Boolean                                  */
/* -------------------------------------------------------------------------- */
export const BooleanField = object({
	...BaseField.entries,
	component: optional(union([literal("checkbox"), literal("switch")]))
})
export type BooleanField = InferOutput<typeof BooleanField>

/* -------------------------------------------------------------------------- */
/*                                    Date                                    */
/* -------------------------------------------------------------------------- */
export const DateField = object({
	...BaseField.entries
})
export type DateField = InferOutput<typeof DateField>

export const AllFormFields = union([InputField, NumberField, SelectField, BooleanField, DateField])

/* -------------------------------------------------------------------------- */
/*                                    Array                                   */
/* -------------------------------------------------------------------------- */
export const ArrayField = object({
	...BaseField.entries,
	content: AllFormFields
})
export type ArrayField = InferOutput<typeof ArrayField>

/* -------------------------------------------------------------------------- */
/*                                    Form                                    */
/* -------------------------------------------------------------------------- */
export const FormField = union([
	ArrayField, // this must be placed first, otherwise its content field won't be parsed
	InputField,
	NumberField,
	SelectField,
	BooleanField,
	DateField
])
export type FormField = InferOutput<typeof FormField>
// export type Form = InferOutput<typeof Form>
export type Form = {
	nodeName: FormNodeName
	title?: string
	description?: string
	submitBtnText?: string
	key: string
	fields: (FormField | Form)[]
}
export const Form: GenericSchema<Form> = object({
	nodeName: FormNodeName,
	key: string(),
	fields: array(union([lazy(() => Form), FormField]))
})
