import * as v from "valibot"

export const WatchEvent = v.object({
	type: v.object({
		modify: v.object({
			kind: v.union([v.literal("data"), v.literal("metadata")]),
			mode: v.union([v.literal("any"), v.literal("content")])
		})
	}),
	paths: v.array(v.string())
})
export type WatchEvent = v.InferOutput<typeof WatchEvent>
