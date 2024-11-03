import { toJSONSchema } from "@gcornut/valibot-json-schema"

export function getJsonSchema(schema: any) {
	return JSON.stringify(toJSONSchema({ schema }), null, 2)
}
