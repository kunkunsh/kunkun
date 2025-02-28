import type { ListSchema } from "@kksh/api/models"

export type Section = ListSchema.Section & {
	sectionHeight: number
	sectionRef: HTMLDivElement | null
}
