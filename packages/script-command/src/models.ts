import * as v from "valibot"

export const ScriptCommandMode = v.union([
	v.literal("compact"),
	v.literal("fullOutput"),
	v.literal("inline"),
	v.literal("silent")
])
export const ScriptCommandConfig = v.object({
	scriptPath: v.nullable(v.string()),
	schemaVersion: v.optional(v.number(), 1),
	title: v.string(),
	mode: v.optional(ScriptCommandMode, "fullOutput"),
	icon: v.optional(v.string()),
	packageName: v.optional(v.string()),
	needsConfirmation: v.optional(v.boolean(), false),
	description: v.optional(v.string()),
	author: v.optional(v.string()),
	authorURL: v.optional(v.string())
})

export type ScriptCommandConfig = v.InferOutput<typeof ScriptCommandConfig>
