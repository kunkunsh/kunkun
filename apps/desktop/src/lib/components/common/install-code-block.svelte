<script lang="ts">
	import { cn } from "@/utils"
	import { Button } from "@kksh/svelte5"
	import { Shiki } from "@kksh/ui"
	import { confirm } from "@tauri-apps/plugin-dialog"
	import { platform } from "@tauri-apps/plugin-os"
	import { toast } from "svelte-sonner"
	import { writeText } from "tauri-plugin-clipboard-api"
	import {
		executeBashScript,
		executePowershellScript,
		type ChildProcess
	} from "tauri-plugin-shellx-api"

	let {
		code,
		alreadyInstalled,
		lang,
		class: className
	}: {
		code: string
		alreadyInstalled?: boolean
		lang: "bash" | "powershell"
		class?: string
	} = $props()

	function copy() {
		return writeText(code).then(() => toast.info("Copied to clipboard", { description: code }))
	}

	async function autoInstall() {
		let cmd: ChildProcess<string> | undefined
		if (alreadyInstalled) {
			const ans = await confirm("Already installed, do you really want to run this command?")
			if (!ans) return
		}
		try {
			toast.info("Installing...")
			if (platform() === "macos") {
				cmd = await executeBashScript(code)
			} else if (platform() === "windows") {
				cmd = await executePowershellScript(code)
			} else if (platform() === "linux") {
				cmd = await executeBashScript(code)
			}
			if (cmd) {
				console.log(cmd.code)
				console.log(cmd.stdout)
				console.log(cmd.stderr)
			}
			toast.success("Installed successfully")
		} catch (error) {
			toast.error("Failed to install")
			console.error(error)
		}
	}
</script>

<div class={cn("flex items-center gap-2", className)}>
	<Shiki class={cn("w-full rounded-md p-1 px-2")} {code} {lang} />
	<Button class="" size="sm" variant="secondary" onclick={copy}>Copy</Button>
	<Button class="" size="sm" variant="secondary" onclick={autoInstall}>Auto Install</Button>
</div>
