import { relations } from "drizzle-orm/relations"
import { commands, extensionData, extensions } from "./schema"

export const commandsRelations = relations(commands, ({ one }) => ({
	extension: one(extensions, {
		fields: [commands.extId],
		references: [extensions.extId]
	})
}))

export const extensionsRelations = relations(extensions, ({ many }) => ({
	commands: many(commands),
	extensionData: many(extensionData)
}))

export const extensionDataRelations = relations(extensionData, ({ one }) => ({
	extension: one(extensions, {
		fields: [extensionData.extId],
		references: [extensions.extId]
	})
}))
