import { Action as ActionSchema } from "@kksh/api/models"

export interface AppState {
	searchTerm: string
	highlightedCmd: string
	loadingBar: boolean
	defaultAction: string
	actionPanel?: ActionSchema.ActionPanel
}
