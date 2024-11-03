import { plistToJson } from "../../commands/utils"
import type { IUtils } from "../client"

export function constructUtilsApi(): IUtils {
	return {
		plist: {
			// build: (data: any) => {
			// 	return Promise.resolve(plist.build(data))
			// },
			/**
			 * parse plist content to json string
			 * @param plistContent
			 * @returns
			 */
			parse: (plistContent: string) => {
				return plistToJson(plistContent)
			}
		}
	}
}
