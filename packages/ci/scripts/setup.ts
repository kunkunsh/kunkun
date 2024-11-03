import path from "path"
import { PACKAGES_PATHS } from "@/path"
import { $ } from "bun"

// Initialize .env files
await $`bun ${path.join(PACKAGES_PATHS.CI, "scripts", "init-env.ts")}`
