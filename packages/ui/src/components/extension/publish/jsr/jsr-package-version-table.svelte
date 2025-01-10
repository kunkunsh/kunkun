<script lang="ts">
	import { Button, HoverCard, Table } from "@kksh/svelte5"
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
		githubOwnerMismatch,
		versions,
		onPublish,
		publishedVersions
	}: {
		class?: string
		githubOwnerMismatch: boolean
		versions: Version[]
		onPublish?: (version: Version) => void
		publishedVersions: string[]
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
			<Table.Head class="text-center">Published</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body class="max-h-96">
		{#each versions as version, i (i)}
			{@const isPublished = publishedVersions.includes(version.version)}
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
					{@const disabled =
						version.yanked || !version.rekorLogId || githubOwnerMismatch || isPublished}
					{#if disabled}
						<HoverCard.Root>
							<HoverCard.Trigger>
								<Button size="sm" variant="outline" disabled={true}>Publish</Button>
							</HoverCard.Trigger>
							<HoverCard.Content>
								{#if version.yanked}
									Version is yanked
								{:else if !version.rekorLogId}
									Version is not signed by GitHub Action
								{:else if githubOwnerMismatch}
									Your GitHub account is not the owner of the package
								{:else if isPublished}
									Version is already published
								{/if}
							</HoverCard.Content>
						</HoverCard.Root>
					{:else}
						<Button size="sm" variant="outline" onclick={() => onPublish?.(version)}>
							Publish
						</Button>
					{/if}
				</Table.Cell>
				<Table.Cell class="text-center">
					{isPublished ? "✅" : "❌"}
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
	<Table.Footer></Table.Footer>
</Table.Root>
