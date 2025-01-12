<script lang="ts">
	import { appConfig, devStoreExts, extensions, installedStoreExts } from "@/stores"
	import { ExtPackageJsonExtra } from "@kksh/api/models"
	import * as extAPI from "@kksh/extension"
	import { Button, Table } from "@kksh/svelte5"
	import { error } from "@tauri-apps/plugin-log"
	import { TrashIcon } from "lucide-svelte"
	import { toast } from "svelte-sonner"
	import { derived, get } from "svelte/store"

	let uninstalling = $state(false)

	function onUninstall(ext: ExtPackageJsonExtra) {
		uninstalling = true
		const extContainerPath = get(appConfig).extensionsInstallDir
		const isDev = extContainerPath && extAPI.isExtPathInDev(extContainerPath, ext.extPath)
		console.log("uninstall extension (isDev): ", isDev)

		const uninstallFunc = isDev
			? extensions.uninstallDevExtensionByIdentifier
			: extensions.uninstallStoreExtensionByIdentifier

		return uninstallFunc(ext.kunkun.identifier)
			.then((uninstalledExt) => {
				toast.success(`${uninstalledExt.name} Uninstalled`)
			})
			.catch((err) => {
				toast.error("Fail to uninstall extension", { description: err })
				error(`Fail to uninstall store extension (${ext.kunkun.identifier}): ${err}`)
			})
			.finally(() => {
				uninstalling = false
			})
	}
</script>

{#snippet extRow(ext: ExtPackageJsonExtra, type: "Dev Extension" | "Extension")}
	<Table.Row>
		<Table.Cell class="font-medium">{ext.kunkun.name}</Table.Cell>
		<Table.Cell class="">{ext.kunkun.identifier}</Table.Cell>
		<Table.Cell>{type}</Table.Cell>
		<Table.Cell>{ext.version}</Table.Cell>
		<Table.Cell>
			<Button
				variant="destructive"
				size="icon"
				disabled={uninstalling}
				onclick={() => onUninstall(ext)}
			>
				<TrashIcon />
			</Button>
		</Table.Cell>
	</Table.Row>
{/snippet}
<main class="container">
	<h1 class="text-2xl font-bold">Your Extensions</h1>
	<Table.Root>
		<Table.Caption>Your Extensions</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head>Name</Table.Head>
				<Table.Head>Identifier</Table.Head>
				<Table.Head>Type</Table.Head>
				<Table.Head>Version</Table.Head>
				<Table.Head>Uninstall</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each $devStoreExts as ext, i (i)}
				{@render extRow(ext, "Dev Extension")}
			{/each}
			{#each $installedStoreExts as ext, i (i)}
				{@render extRow(ext, "Extension")}
			{/each}
		</Table.Body>
		<!-- <Table.Footer>
			<Table.Row>
				<Table.Cell colspan={3}>Total</Table.Cell>
				<Table.Cell class="text-right">$2,500.00</Table.Cell>
			</Table.Row>
		</Table.Footer> -->
	</Table.Root>
</main>
