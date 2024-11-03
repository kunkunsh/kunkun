import { mockIPC } from "@tauri-apps/api/mocks"
import { describe, expect, test } from "bun:test"
import { translateDenoCommand } from "../deno"

// can't run this because it relies on Tauri API, I can't run it without Tauri app env, may need to mock the API
// test("translateDenoCommand", async () => {
// 	// mockIPC((cmd, args) => {
// 	// 	// simulated rust command called "add" that just adds two numbers
// 	// 	console.log("cmd and args", cmd, args);

// 	// 	// if (cmd === "add") {
// 	// 	// 	return (args.a as number) + (args.b as number)
// 	// 	// }
// 	// })
// 	const cmdOptions = await translateDenoCommand(
// 		"$EXTENSION/src/test.ts",
// 		{
// 			allowAllEnv: false,
// 			allowEnv: ["PATH"],
// 			allowAllNet: true,
// 			allowNet: [],
// 			denyAllRead: true
// 		},
// 		[],
// 		"/extensions/ext"
// 	)

// 	expect(cmdOptions.args).toEqual([
// 		"run",
// 		"--allow-env=PATH",
// 		"--allow-net",
// 		"--deny-read",
// 		"/extensions/ext/src/test.ts"
// 	])
// 	console.log(cmdOptions)
// })
