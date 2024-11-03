import { $ } from "bun"

// Generate deno.d.ts under packages/api
const denoTypes = await $`deno types`.text()
Bun.write("deno.d.ts", denoTypes)
