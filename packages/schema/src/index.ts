import { toJsonSchema } from "@valibot/to-json-schema"

export function getJsonSchema(schema: any) {
	return JSON.stringify(toJsonSchema(schema), null, 2)
}
