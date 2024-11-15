import path from "path"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			$lib: path.resolve("./src/lib")
		}
	}
})
