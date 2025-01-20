<script lang="ts">
	import * as m from "@/paraglide/messages"
	import { db } from "@kksh/api/commands"
	import { loadExtensionManifestFromDisk } from "@kksh/extension"
	import { Button, Dialog, Table } from "@kksh/svelte5"
	import { join } from "@tauri-apps/api/path"
	import { exists } from "@tauri-apps/plugin-fs"
	import { onMount } from "svelte"
	import { toast } from "svelte-sonner"
	import { open } from "tauri-plugin-shellx-api"

	type Result = {
		identifier: string
		path: string
		error?: string
	}

	let results = $state<Result[]>([])
	let isDialogOpen = $state(false)
	let errorMsg = $state<string | undefined>()

	const sortedResults = $derived.by(() =>
		results.slice().sort((a, b) => {
			return a.error ? -1 : 1
		})
	)

	async function check() {
		results = []
		const tmpResults = []
		const extensions = await db.getAllExtensions()
		for (const ext of extensions) {
			if (!ext.path) continue
			const _exists = await exists(ext.path)
			let error: string | undefined = undefined
			if (!_exists) {
				error = `Extension path (${ext.path}) does not exist`
			}
			const pkgJsonPath = await join(ext.path, "package.json")
			const _pkgJsonExists = await exists(pkgJsonPath)
			if (!_pkgJsonExists) {
				error = `Extension package.json (${pkgJsonPath}) does not exist`
			}
			try {
				const manifest = await loadExtensionManifestFromDisk(pkgJsonPath)
			} catch (err) {
				error = `Failed to load manifest from ${pkgJsonPath}: ${err}`
			}

			tmpResults.push({
				identifier: ext.identifier,
				path: ext.path,
				error
			})
		}
		results = tmpResults
		const numErrors = results.filter((r) => r.error).length
		const toastFn = numErrors > 0 ? toast.error : toast.info
		toastFn(`${numErrors} errors found`, {
			description: numErrors > 0 ? "Click on an error to see more details" : undefined
		})
	}

	function onErrorClick(errMsg?: string) {
		if (errMsg) {
			isDialogOpen = true
			errorMsg = errMsg
		} else {
			toast.info("No error message")
		}
	}

	onMount(() => {
		check()
	})
</script>

<div class="container">
	<h1 class="text-2xl font-bold">{m.troubleshooters_extension_loading_title()}</h1>
	<Button class="my-2" onclick={check}>{m.common_check()}</Button>
	<Dialog.Root bind:open={isDialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Error Details</Dialog.Title>
			</Dialog.Header>
			{errorMsg}
		</Dialog.Content>
	</Dialog.Root>
	<Table.Root>
		<Table.Caption>A list of your extensions.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class=""
					>{m.troubleshooters_extension_loading_table_col_identifier()}</Table.Head
				>
				<Table.Head>{m.troubleshooters_extension_loading_table_col_path()}</Table.Head>
				<Table.Head>{m.troubleshooters_extension_loading_table_col_error()}</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each sortedResults as row}
				<Table.Row>
					<Table.Cell class="font-medium"><pre>{row.identifier}</pre></Table.Cell>
					<Table.Cell class="">
						<button onclick={() => open(row.path)} class="text-left">
							<pre class="cursor-pointer text-wrap">{row.path}</pre>
						</button>
					</Table.Cell>
					<Table.Cell class="text-right">
						<button onclick={() => onErrorClick(row.error)}>
							{row.error ? "⚠️" : "✅"}
						</button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<style>
	:global(body) {
		overflow-x: hidden;
	}
</style>
