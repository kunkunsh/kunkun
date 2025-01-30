import { defineConfig } from "tsup"

// ".": "./src/index.ts",
// "./ui": "./src/ui/index.ts",
// "./ui/iframe": "./src/ui/iframe/index.ts",
// "./ui/worker": "./src/ui/worker/index.ts",
// "./headless": "./src/headless/index.ts",
// "./models": "./src/models/index.ts",
// "./commands": "./src/commands/index.ts",
// "./runtime/deno": "./src/runtime/deno.ts",
// "./permissions": "./src/permissions/index.ts",
// "./dev": "./src/dev/index.ts",
// "./events": "./src/events.ts",

export default defineConfig({
	entry: {
		index: "./src/index.ts",
		"ui/index": "./src/ui/index.ts",
		"ui/iframe/index": "./src/ui/iframe/index.ts",
		"ui/worker/index": "./src/ui/worker/index.ts",
		"headless/index": "./src/headless/index.ts",
		"models/index": "./src/models/index.ts",
		"commands/index": "./src/commands/index.ts",
		"runtime/deno": "./src/runtime/deno.ts",
		"permissions/index": "./src/permissions/index.ts",
		"dev/index": "./src/dev/index.ts",
		events: "./src/events.ts"
	},
	format: ["esm", "cjs"],
	splitting: false,
	sourcemap: true,
	clean: true,
	dts: true,
	// external: ["@tauri-apps/api", "@tauri-apps/plugin-*", "tauri-plugin-*", "node-fetch", "minimatch"]
})
