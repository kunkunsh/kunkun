import { CustomPosition, type Position } from "@kksh/api/models"
import * as v from "valibot"

export function positionToTailwindClasses(position: Position) {
	switch (position) {
		case "top-left":
			return "top-2 left-2"
		case "top-right":
			return "top-2 right-2"
		case "bottom-left":
			return "bottom-2 left-2"
		case "bottom-right":
			return "bottom-2 right-2"
		default:
			let className = ""
			const parseOutput = v.safeParse(CustomPosition, position)
			if (!parseOutput.success) {
				return ""
			}
			if (parseOutput.output.top) {
				className += ` top-[${parseOutput.output.top / 4}rem]`
			}
			if (parseOutput.output.right) {
				className += ` right-[${parseOutput.output.right / 4}rem]`
			}
			if (parseOutput.output.bottom) {
				className += ` bottom-[${parseOutput.output.bottom / 4}rem]`
			}
			if (parseOutput.output.left) {
				className += ` left-[${parseOutput.output.left / 4}rem]`
			}
			return className
	}
}
