<script lang="ts">
	import { Button, Table } from "@kksh/svelte5"

	type Version = {
		scope: string
		package: string
		version: string
		yanked: boolean
		rekorLogId?: string
	}
	let { versions, onPublish }: { versions: Version[]; onPublish?: (version: Version) => void } =
		$props()
</script>

<Table.Root class="">
	<Table.Caption>All versions of the package</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-[100px]">Version</Table.Head>
			<Table.Head>Yanked</Table.Head>
			<Table.Head>Signed by GitHub Action</Table.Head>
			<Table.Head>Publish This Version</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each versions as version, i (i)}
			<Table.Row>
				<Table.Cell class="font-medium">
					<a
						href={`https://jsr.io/@${version.scope}/${version.package}@${version.version}`}
						target="_blank"
						class="text-blue-500 underline"
					>
						{version.version}
					</a>
				</Table.Cell>
				<Table.Cell class="text-center">{version.yanked ? "Yes" : "No"}</Table.Cell>
				<Table.Cell class="text-center">{version.rekorLogId ? "✅" : "❌"}</Table.Cell>
				<Table.Cell class="text-center">
					<Button
						size="sm"
						variant="outline"
						disabled={version.yanked || !version.rekorLogId}
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
