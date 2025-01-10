<script lang="ts">
	import { Button, Table } from "@kksh/svelte5"
	import { cn } from "../../../../utils"

	type Version = {
		scope: string
		package?: string
		version: string
		yanked: boolean
		rekorLogId?: string
	}
	let {
		class: className,
		noPublish,
		versions,
		onPublish
	}: {
		class?: string
		noPublish: boolean
		versions: Version[]
		onPublish?: (version: Version) => void
	} = $props()
</script>

<Table.Root class={className}>
	<Table.Caption>All versions of the package</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-[100px] text-center">Version</Table.Head>
			<Table.Head class="text-center">Yanked</Table.Head>
			<Table.Head class="text-center">Signed by GitHub Action</Table.Head>
			<Table.Head class="text-center">Publish This Version</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body class="max-h-96">
		{#each versions as version, i (i)}
			<Table.Row>
				<Table.Cell class="text-center font-medium">
					<a
						href={`https://jsr.io/@${version.scope}/${version.package}@${version.version}`}
						target="_blank"
						class="text-blue-500 underline"
					>
						{version.version}
					</a>
				</Table.Cell>
				<Table.Cell
					class={cn("text-center font-bold", {
						"text-red-500": version.yanked,
						"text-green-500": !version.yanked
					})}
				>
					{version.yanked ? "Yes" : "No"}
				</Table.Cell>
				<Table.Cell class="text-center">{version.rekorLogId ? "✅" : "❌"}</Table.Cell>
				<Table.Cell class="text-center">
					<Button
						size="sm"
						variant="outline"
						disabled={version.yanked || !version.rekorLogId || noPublish}
						onclick={() => onPublish?.(version)}
					>
						Publish
					</Button>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
	<Table.Footer></Table.Footer>
</Table.Root>
