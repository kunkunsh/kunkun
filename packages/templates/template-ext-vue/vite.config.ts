import path from "node:path"
import vue from "@vitejs/plugin-vue"
import autoprefixer from "autoprefixer"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
	css: {
		postcss: {
			plugins: [autoprefixer()]
		}
	},
	plugins: [vue()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	}
})
