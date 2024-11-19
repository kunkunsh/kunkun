<script lang="ts">
	import AddDevExtForm from "@/components/standalone/settings/AddDevExtForm.svelte"
	import DevExtPathForm from "@/components/standalone/settings/DevExtPathForm.svelte"
	import { appConfig, extensions } from "@/stores"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack, goHome } from "@/utils/route"
	import * as extAPI from "@kksh/extension"
	import { installFromNpmPackageName } from "@kksh/extension"
	import { Button, Separator, SideBar } from "@kksh/svelte5"
	import { StrikeSeparator } from "@kksh/ui"
	import { open as openFileSelector } from "@tauri-apps/plugin-dialog"
	import * as fs from "@tauri-apps/plugin-fs"
	import { goto } from "$app/navigation"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { toast } from "svelte-sonner"
	import * as v from "valibot"

	const { useSidebar } = SideBar
	const sidebar = useSidebar()
</script>

<main class="container">
	<h2 class="text-2xl font-bold">Add Dev Extension</h2>
	<small>
		There are 4 options to install an extension in developer mode. Either load it from your local
		tarball file, a tarball remote URL, npm package name or load from a remote URL.
	</small>
	<AddDevExtForm />
</main>
