import path from "path"
import { PACKAGES_PATHS } from "@/path"
import { $ } from "bun"

// Initialize .env files
await $`bun ${path.join(PACKAGES_PATHS.CI, "scripts", "init-env.ts")}`

// Generate deno.d.ts under packages/api
const denoTypes = await $`deno types`.text()
Bun.write(path.join(PACKAGES_PATHS.API, "deno.d.ts"), denoTypes)
