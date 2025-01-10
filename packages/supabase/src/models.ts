/**
 * @module @kksh/supabase/models
 * This module contains some models for supabase database that cannot be code generated, such as JSON fields.
 */
import * as v from "valibot";

export enum ExtPublishSourceTypeEnum {
    jsr = "jsr",
    npm = "npm",
}

export const ExtPublishMetadata = v.object({
    source: v.optional(
        v.string("Source of the extension (e.g. url to package)"),
    ),
    sourceType: v.optional(v.enum(ExtPublishSourceTypeEnum)),
});
export type ExtPublishMetadata = v.InferOutput<typeof ExtPublishMetadata>;
