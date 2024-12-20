<script lang="ts">
	import DragNDrop from "@/components/common/DragNDrop.svelte"
	import DevExtPathForm from "@/components/standalone/settings/DevExtPathForm.svelte"
	import { appConfig, extensions } from "@/stores"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { IconEnum } from "@kksh/api/models"
	import * as extAPI from "@kksh/extension"
	import { installFromNpmPackageName } from "@kksh/extension"
	import { Button, Card } from "@kksh/svelte5"
	import { cn } from "@kksh/svelte5/utils"
	import { IconMultiplexer, Layouts, StrikeSeparator } from "@kksh/ui"
	import { open as openFileSelector } from "@tauri-apps/plugin-dialog"
	import * as fs from "@tauri-apps/plugin-fs"
	import { enhance } from "$app/forms"
	import { goto } from "$app/navigation"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { toast } from "svelte-sonner"
	import * as v from "valibot"
	import InstallNpmPackageNameForm from "./install-npm-package-name-form.svelte"
	import InstallTarballUrlForm from "./install-tarball-url-form.svelte"

	let dragging = $state(false)

	async function handleDragNDropInstall(paths: string[]) {
		dragging = false
		console.log(paths)
		for (const path of paths) {
			const stat = await fs.stat(path)
			if (await stat.isDirectory) {
				await extensions
					.installDevExtensionDir(path)
					.then((ext) => {
						toast.success("Success", {
							description: `Extension from ${ext.extPath} installed successfully`
						})
					})
					.catch((err) => {
						toast.warning("Failed to install extension", { description: err })
					})
			} else if (await stat.isFile) {
				if (!$appConfig.devExtensionPath) {
					toast.warning(
						"Please set the dev extension path in the settings to install tarball extension"
					)
					continue
				}
				await extensions
					.installTarball(path, $appConfig.devExtensionPath)
					.then((ext) => {
						toast.success("Success", {
							description: `Extension from ${path} installed successfully`
						})
					})
					.catch((err) => {
						toast.warning("Failed to install extension", { description: err })
					})
			} else {
				toast.warning(`Unsupported file type: ${path}`)
			}
			// await installDevExtensionDir(path)
		}
	}

	async function pickExtFolders() {
		const selected = await openFileSelector({
			directory: true,
			multiple: true // allow install multiple extensions at once
		})
		if (!selected) {
			return toast.warning("No File Selected")
		}
		for (const dir of selected) {
			await extensions
				.installDevExtensionDir(dir)
				.then((ext) => {
					toast.success("Success", {
						description: `Extension from ${ext.extPath} installed successfully`
					})
				})
				.catch((err) => {
					toast.warning("Failed to install extension", { description: err })
				})
		}
	}

	async function pickExtFiles() {
		if (!$appConfig.devExtensionPath) {
			toast.warning("Please set the dev extension path in the settings")
			return goto("/appsettings/set-dev-ext-path")
		}
		const selected = await openFileSelector({
			directory: false,
			multiple: true, // allow install multiple extensions at once
			filters: [
				{
					name: "tarball file",
					extensions: ["tgz", "gz", "kunkun"]
				}
			]
		})
		if (!selected) {
			return toast.warning("No File Selected")
		}
		for (const tarballPath of selected) {
			await extensions.installTarball(tarballPath, $appConfig.devExtensionPath)
		}
	}
</script>

<div class="my-3 flex justify-center gap-3">
	<Button size="sm" onclick={pickExtFolders}>Install from Extension Folders</Button>
	<Button size="sm" onclick={pickExtFiles}>Install from Extension Tarball File</Button>
</div>

<StrikeSeparator class="my-1">
	<h3 class="text-muted-foreground font-mono text-sm">Drag and Drop</h3>
</StrikeSeparator>

<Layouts.Center>
	<DragNDrop
		onDrop={(e) => {
			handleDragNDropInstall(e.payload.paths)
		}}
		onEnter={() => (dragging = true)}
		onCancelled={() => (dragging = false)}
	>
		<Card.Root
			class={cn("h-36 w-96", dragging ? "border-lime-400/30" : "text-white hover:text-blue-200")}
		>
			<button
				class="flex h-full w-full cursor-pointer items-center justify-center"
				onclick={pickExtFolders}
			>
				<div class={cn("flex flex-col items-center", dragging ? "text-lime-400/70" : "")}>
					<IconMultiplexer
						icon={{ value: "mdi:folder-cog-outline", type: IconEnum.Iconify }}
						class="h-10 w-10"
					/>
					<small class="select-none font-mono text-xs">Drag and Drop</small>
					<small class="select-none font-mono text-xs">Extension Folder or Tarball</small>
				</div>
			</button>
		</Card.Root>
	</DragNDrop>
</Layouts.Center>
<StrikeSeparator class="my-1">
	<h3 class="text-muted-foreground font-mono text-sm">Install Tarball From URL</h3>
</StrikeSeparator>
<InstallTarballUrlForm />
<InstallNpmPackageNameForm />
