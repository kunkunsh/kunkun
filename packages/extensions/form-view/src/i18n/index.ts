import i18next from "i18next"
import en, { type Translation } from "./en"
import zh from "./zh"

export function setupI18n(language: "en" | "zh" = "en") {
	i18next.init({
		resources: {
			en: {
				translation: en
			},
			zh: {
				translation: zh
			}
		},
		lng: language, // default language
		fallbackLng: "en"
	})
}

export const t = (key: keyof Translation, options?: any) => i18next.t(key, options)
