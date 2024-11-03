import { $ } from "bun"

// Generate deno.d.ts under packages/api
let denoTypes = await $`deno types`.text()
// grep to filter out the line in denoTypes that contains "no-default-lib"
denoTypes = denoTypes.split("\n").filter((line) => !line.includes("no-default-lib")).join("\n")
Bun.write("deno.d.ts", denoTypes)
