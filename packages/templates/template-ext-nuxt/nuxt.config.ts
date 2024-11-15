// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	css: ["@kksh/vue/css", "@kksh/vue/themes"],
	devtools: { enabled: true },
	ssr: false,
	devServer: {
		port: 5173 // avoid conflict Desktop App in Dev Mode
	},
	nitro: {
		output: {
			publicDir: "dist"
		}
	},
	modules: ["@nuxtjs/tailwindcss"]
})
