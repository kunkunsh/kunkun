import { defineConfig, defineWebExtConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
	srcDir: "src",
	modules: ["@wxt-dev/module-svelte"],
	webExt: defineWebExtConfig({
		disabled: true
	})
})
