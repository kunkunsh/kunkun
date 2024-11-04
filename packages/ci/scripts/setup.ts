import fs from "fs"
import path from "path"
import { PACKAGES_PATHS } from "@/path"
import { $ } from "bun"

// Initialize .env files
await $`bun ${path.join(PACKAGES_PATHS.CI, "scripts", "init-env.ts")}`

/* -------------------------------------------------------------------------- */
/*                             Download Dance JSON                            */
/* -------------------------------------------------------------------------- */
// const res = await fetch("https://dance.kunkun.sh/api/data")
// const danceFilePath = path.join(PACKAGES_PATHS.DESKTOP, "./src/lib/dance.json")
// Bun.write(danceFilePath, await res.text())
