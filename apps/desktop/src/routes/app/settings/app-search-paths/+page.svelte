<script lang="ts">
	import { appsLoader } from "@/stores"
	import { SearchPath } from "@kksh/api/models"
	import { Button, Input, Table } from "@kksh/svelte5"
	import { Form } from "@kksh/ui"
	import * as dialog from "@tauri-apps/plugin-dialog"
	import * as fs from "@tauri-apps/plugin-fs"
	import { appConfig } from "$lib/stores/appConfig"
	import { Inspect } from "svelte-inspect-value"
	import { toast } from "svelte-sonner"
	import SuperDebug, { defaults, superForm } from "sveltekit-superforms"
	import { valibot, valibotClient } from "sveltekit-superforms/adapters"
	import { open } from "tauri-plugin-shellx-api"
	import * as v from "valibot"

	export const SearchPathFormSchema = v.object({
		path: v.pipe(v.string(), v.minLength(1)),
		depth: v.optional(v.number(), 1)
	})

	const form = superForm(defaults(valibot(SearchPathFormSchema)), {
		validators: valibotClient(SearchPathFormSchema),
		SPA: true,
		async onUpdate({ form, cancel }) {
			if (!form.valid) {
				return
			}
			const { path, depth } = form.data
			if (!(await fs.exists(path))) {
				return toast.error("Path does not exist")
			}
			appConfig.addAppSearchPath({ path, depth })
			toast.success("Search Path Added")
			appsLoader.init()
			cancel()
		}
	})
	const { form: formData, enhance, errors } = form

	async function pickSearchPath() {
		const result = await dialog.open({
			directory: true
		})
		if (result) {
			$formData.path = result
		}
	}
</script>

<main class="container flex flex-col space-y-2">
	<h1 class="text-2xl font-bold">Extra App Search Paths</h1>
	{#if $appConfig.developerMode}
		<Inspect name="Extra App Search Paths" value={$appConfig.appSearchPaths} />
	{/if}
	<form method="POST" use:enhance>
		<Form.Field {form} name="path">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Path</Form.Label>
					<div class="flex items-center gap-1">
						<Input {...props} disabled bind:value={$formData.path} placeholder="Search Path" />
						<Form.Button class="my-1" onclick={pickSearchPath}>Pick</Form.Button>
					</div>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="depth">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Search Depth</Form.Label>
					<Input {...props} type="number" bind:value={$formData.depth} placeholder="Depth" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Button class="w-full" type="submit">Add App Search Path</Button>
	</form>

	{#if $appConfig.developerMode}
		<SuperDebug data={$formData} />
	{/if}

	<Table.Root>
		<Table.Caption>Your App Search Paths</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head>Search Path</Table.Head>
				<Table.Head class="text-center">Depth</Table.Head>
				<Table.Head class="text-center">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each $appConfig.appSearchPaths as appSearchPath, i (i)}
				<Table.Row>
					<Table.Cell
						class="cursor-pointer font-medium"
						onclick={() => {
							open(appSearchPath.path)
						}}
					>
						<code>{appSearchPath.path}</code>
					</Table.Cell>
					<Table.Cell class="text-center">{appSearchPath.depth}</Table.Cell>
					<Table.Cell class="text-center">
						<Button
							variant="destructive"
							onclick={() => {
								appConfig.removeAppSearchPath(appSearchPath)
								toast.error("Search Path Removed")
								appsLoader.init()
							}}
						>
							Remove
						</Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</main>
