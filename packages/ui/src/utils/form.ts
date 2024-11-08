import { FormNodeNameEnum, type FormSchema } from "@kksh/api/ui/worker"
import type { BaseIssue, BaseSchema } from "valibot"
import * as v from "valibot"

function addDefaultToSchema(
	schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	field: FormSchema.BaseField
) {
	if (field.default) {
		schema = v.optional(schema, field.default)
	}
	return schema
}

export function buildFormSchema(form: FormSchema.Form): v.ObjectSchema<any, undefined> {
	let schema = v.object({})
	for (const field of form.fields) {
		let fieldSchema: any = undefined
		if (field.nodeName === FormNodeNameEnum.Input) {
			fieldSchema = v.string()
		} else if (field.nodeName === FormNodeNameEnum.Number) {
			fieldSchema = v.number()
		} else if (field.nodeName === FormNodeNameEnum.Select) {
			fieldSchema = v.string()
			// fieldSchema = v.picklist((field as FormSchema.SelectField).options)
			// schema = v.object({ ...schema.entries, [field.key]: fieldSchema })
			// continue
		} else if (field.nodeName === FormNodeNameEnum.Boolean) {
			fieldSchema = v.boolean()
		} else if (field.nodeName === FormNodeNameEnum.Date) {
			fieldSchema = v.date()
		} else {
			console.warn(`Unknown field type: ${field.nodeName}`)
		}
		fieldSchema = addDefaultToSchema(fieldSchema, field)
		if ((field as FormSchema.BaseField).optional) {
			fieldSchema = v.nullable(v.optional(fieldSchema))
		}
		if ((field as FormSchema.BaseField).description) {
			fieldSchema = v.pipe(fieldSchema, v.description((field as FormSchema.BaseField).description!))
		}
		if (fieldSchema) {
			schema = v.object({ ...schema.entries, [field.key]: fieldSchema })
		}
	}
	return schema
}
