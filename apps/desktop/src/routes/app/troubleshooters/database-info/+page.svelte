<script lang="ts">
	import { proxyDB, schema } from "@kksh/drizzle"
	import { Button, Table } from "@kksh/svelte5"
	import { count, sql } from "drizzle-orm"
	import prettyBytes from "pretty-bytes"
	import { onMount } from "svelte"

	let tableSizes = $state<{ table_name: string; size: number }[]>([])
	let tableRows = $state<{
		extensions: number
		commands: number
		extensionData: number
	}>({
		extensions: 0,
		commands: 0,
		extensionData: 0
	})

	onMount(() => {
		getDatabaseInfo()
		getTableRows()
	})

	async function getDatabaseInfo() {
		const statement = sql`
            SELECT
                name AS table_name,
                SUM(pgsize) AS size
            FROM
                dbstat
            GROUP BY
                name
            ORDER BY
                size DESC;
        `
		tableSizes = ((await proxyDB.all(statement)) as [string, number][]).map((t) => ({
			table_name: t[0],
			size: t[1]
		}))
	}

	async function getTableRows() {
		const rows = await Promise.all([
			proxyDB
				.select({
					count: count()
				})
				.from(schema.extensions),

			proxyDB
				.select({
					count: count()
				})
				.from(schema.commands),

			proxyDB
				.select({
					count: count()
				})
				.from(schema.extensionData)
		])

		tableRows.extensions = rows[0][0].count
		tableRows.commands = rows[1][0].count
		tableRows.extensionData = rows[2][0].count
	}
</script>

<div class="container">
	<h1 class="text-2xl font-bold">Database Info</h1>
	<Table.Root>
		<Table.Caption>Table Sizes</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head>Table Name</Table.Head>
				<Table.Head>Size</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each tableSizes as tableSize}
				<Table.Row>
					<Table.Cell class="font-medium">{tableSize.table_name}</Table.Cell>
					<Table.Cell>{prettyBytes(tableSize.size)}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<Table.Root>
		<Table.Caption>Table Rows</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head>Table Name</Table.Head>
				<Table.Head>Rows</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			<Table.Row>
				<Table.Cell class="font-medium">Extensions</Table.Cell>
				<Table.Cell>{tableRows.extensions}</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-medium">Commands</Table.Cell>
				<Table.Cell>{tableRows.commands}</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-medium">Extension Data</Table.Cell>
				<Table.Cell>{tableRows.extensionData}</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
</div>
