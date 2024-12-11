import { toJsonSchema } from "@valibot/to-json-schema"
import * as v from "valibot"

export function getJsonSchema(schema: v.ObjectSchema<any, any>) {
	return JSON.stringify(toJsonSchema(v.objectWithRest(schema.entries, v.any())), null, 2)
}
