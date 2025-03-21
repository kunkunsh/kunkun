import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
	out: "./drizzle",
	// schema: "./src/db/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: "/Users/hk/Library/Application Support/sh.kunkun.desktop/kk.dev.sqlite"
		// url: process.env.DB_FILE_NAME!
	}
})
