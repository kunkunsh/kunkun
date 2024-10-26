import { describe, expect, test } from "bun:test"
import * as v from "valibot"
import { FormNodeNameEnum } from "../../../../models/constants"
import * as FormSchema from "../form"

const nestedForm: FormSchema.Form = {
	nodeName: FormNodeNameEnum.Form,
	key: "form1",
	fields: [
		{
			nodeName: FormNodeNameEnum.Form,
			key: "form2",
			fields: [
				{
					nodeName: FormNodeNameEnum.Input,
					key: "input1"
				}
			]
		},
		{
			nodeName: FormNodeNameEnum.Number,
			key: "num1"
		},
		{
			key: "array1",
			nodeName: FormNodeNameEnum.Array,
			content: {
				key: "input2",
				nodeName: FormNodeNameEnum.Number
			}
		}
	]
}

const arr: FormSchema.ArrayField = {
	nodeName: FormNodeNameEnum.Array,
	key: "array1",
	content: {
		nodeName: FormNodeNameEnum.Input,
		key: "input1"
	}
}

describe("Verify Nested Form Schema Parsing", () => {
	test("Array Field", () => {
		const result = v.parse(FormSchema.ArrayField, arr)
		expect(result.content.key).toEqual("input1")
	})
	test("Nested Form", () => {
		const result = v.parse(FormSchema.Form, nestedForm)
		expect(result.fields[0].key).toEqual("form2")
		expect((result.fields[0] as FormSchema.Form).fields[0].key).toEqual("input1")
		// console.log(result)
		expect((result.fields[2] as FormSchema.ArrayField).content).toBeDefined()
	})

	test("ext", () => {
		const InputS = v.object({ name: v.string(), value: v.string() })
		const NumberS = v.object({
			name: v.number(),
			value: v.string(),
			content: v.object({
				name: v.string()
			})
		})
		const FormS = v.object({
			name: v.string(),
			arr: v.array(v.union([InputS, NumberS]))
		})
		const result = v.parse(FormS, {
			name: "name",
			arr: [
				{ name: "name", value: "value" },
				{
					name: 1,
					value: "value",
					content: {
						name: "name"
					}
				}
			]
		})
		// console.log(result)
	})
})
