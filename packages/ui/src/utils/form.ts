import { FormNodeNameEnum, type FormSchema } from "@kksh/api/ui/worker"
import * as v from "valibot"

export function buildFormSchema(form: FormSchema.Form): v.ObjectSchema<any, undefined> {
	let schema = v.object({})
	for (const field of form.fields) {
		if (field.nodeName === FormNodeNameEnum.Input) {
			schema = v.object({ ...schema.entries, [field.key]: v.string() })
		} else if (field.nodeName === FormNodeNameEnum.Number) {
			schema = v.object({ ...schema.entries, [field.key]: v.number() })
		} else if (field.nodeName === FormNodeNameEnum.Select) {
			const fieldSelect = field as FormSchema.SelectField
			schema = v.object({ ...schema.entries, [field.key]: v.picklist(fieldSelect.options) })
		} else if (field.nodeName === FormNodeNameEnum.Boolean) {
			schema = v.object({ ...schema.entries, [field.key]: v.boolean() })
		} else if (field.nodeName === FormNodeNameEnum.Date) {
			schema = v.object({ ...schema.entries, [field.key]: v.date() })
		}
	}
	return schema
}
