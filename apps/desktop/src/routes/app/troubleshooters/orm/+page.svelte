<script lang="ts">
	import {
		getAllCmds,
		getAllExtensions,
		getExtensionDataById,
		getUniqueExtensionByIdentifier,
		getUniqueExtensionByPath,
		searchExtensionData,
		updateCmdByID
	} from "@kksh/drizzle/api"
	import * as schema from "@kksh/drizzle/schema"
	import { Button, Input } from "@kksh/svelte5"
	import { CmdTypeEnum, Ext } from "@kunkunapi/src/models/extension"
	import { SearchModeEnum, SQLSortOrderEnum } from "@kunkunapi/src/models/sql"
	import * as path from "@tauri-apps/api/path"
	import * as dialog from "@tauri-apps/plugin-dialog"
	import * as fs from "@tauri-apps/plugin-fs"
	// import * as orm from "drizzle-orm"
	import { Inspect } from "svelte-inspect-value"
	import { toast } from "svelte-sonner"
	import * as v from "valibot"

	let searchText = $state("")
	/* eslint-disable */
	let data = $state<any>(null)
	let inspectTitle = $state("")
</script>

<main class="container space-y-2">
	<Button
		onclick={async () => {
			getAllCmds()
				.then((cmds) => {
					console.log(cmds)
					data = cmds
					inspectTitle = "All Commands"
				})
				.catch((e) => {
					console.error(e)
					toast.error("Failed to get all commands", {
						description: "See console for more details"
					})
				})
		}}
	>
		Get All Commands
	</Button>
	<Button
		onclick={() => {
			getAllExtensions()
				.then((exts) => {
					data = exts
					inspectTitle = "All Extensions"
				})
				.catch((e) => {
					console.error(e)
					toast.error("Failed to get all extensions", {
						description: "See console for more details"
					})
				})
		}}
	>
		Get All Extensions
	</Button>

	<Button
		onclick={async () => {
			// get all extensions with path not null
			const exts = await getAllExtensions()
			for (const ext of exts) {
				if (ext.path === null) continue
				const _ext = await getUniqueExtensionByIdentifier(ext.identifier)
				console.log(_ext)
				if (ext.path) {
					const __ext = await getUniqueExtensionByPath(ext.path)
					console.log(__ext)
				}
			}
			// data = exts
		}}
	>
		Get Unique Extension By Identifier and Path
	</Button>
	<!-- <Button
		onclick={async () => {
			updateCmdByID({
				cmdId: 1,
				name: "google",
				cmdType: CmdTypeEnum.QuickLink,
				data: `{"link":"https://google.com/search?query={argument}","icon":{"type":"remote-url","value":"https://google.com/favicon.ico","invert":false}}`,
				enabled: true
			})
		}}
	>
		Update Command By ID
	</Button> -->
	<Button
		onclick={async () => {
			const _data = await getExtensionDataById(1, ["search_text", "data"])
			data = _data
			inspectTitle = "Extension Data"
		}}
	>
		Get Extension Data By ID
	</Button>
	<form
		class="flex gap-1"
		onsubmit={async (e) => {
			e.preventDefault()
			const _data = await searchExtensionData({
				extId: 1,
				searchMode: SearchModeEnum.FTS,
				searchText: searchText,
				orderByCreatedAt: SQLSortOrderEnum.Desc,
				limit: 10,
				fields: ["search_text", "data"]
			})
			console.log(_data)
			data = _data
			inspectTitle = "Search Results"
		}}
	>
		<Input class="" bind:value={searchText} placeholder="Search Text" />
		<Button class="" type="submit">Search Extension Data</Button>
	</form>
	<Button
		onclick={async () => {
			if (!data) return toast.warning("No Data")
			const defaultPath = await path.join(await path.desktopDir(), "kunkun-orm-troubleshooter.json")
			const res = await dialog.save({
				title: "Export as JSON",
				filters: [{ name: "JSON", extensions: ["json"] }],
				defaultPath: defaultPath
			})
			if (res) {
				// @ts-ignore
				fs.writeTextFile(res, JSON.stringify(data, null, 2))
					.then(() => {
						toast.success("Exported as JSON", {
							description: res
						})
					})
					.catch((err) => {
						toast.error("Failed to export as JSON", {
							description: err.message
						})
					})
			}
		}}
	>
		Export as JSON
	</Button>
	<Inspect name={inspectTitle} value={data} expandLevel={2} />
</main>
