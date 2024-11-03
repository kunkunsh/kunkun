import { $ } from "bun"

// Generate deno.d.ts under packages/api
// check if deno command exists, has to support windows
const denoCommand = Bun.which("deno")
let denoTypes = ""
if (denoCommand) {
	denoTypes = await $`deno types`.text()
} else {
	denoTypes = await (
		await fetch(
			"https://gist.githubusercontent.com/HuakunShen/48d29446b1f937bc9f7a39eef71db586/raw/a64081660d6c7f296d4362c3ea88b70a9a6758e6/deno.d.ts"
		)
	).text()
}

// grep to filter out the line in denoTypes that contains "no-default-lib"
denoTypes = denoTypes
	.split("\n")
	.filter((line) => !line.includes("no-default-lib"))
	.join("\n")
Bun.write("deno.d.ts", denoTypes)
