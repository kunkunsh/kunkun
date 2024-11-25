<script lang="ts">
	import DragNDrop from "@/components/common/DragNDrop.svelte"
	import { cn } from "@/utils"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { downloadFile, getPeers, localNetSendFile } from "@kksh/api/commands"
	import { FileTransferPayload, IconEnum, MdnsServiceInfo, type MdnsPeers } from "@kksh/api/models"
	import { Button, Card, Table } from "@kksh/svelte5"
	import { IconMultiplexer, Layouts } from "@kksh/ui"
	import { listen, type EventCallback, type UnlistenFn } from "@tauri-apps/api/event"
	import * as path from "@tauri-apps/api/path"
	import { confirm } from "@tauri-apps/plugin-dialog"
	import * as fs from "@tauri-apps/plugin-fs"
	import { download } from "@tauri-apps/plugin-upload"
	import { ArrowLeftIcon, SendIcon } from "lucide-svelte"
	import { onDestroy, onMount } from "svelte"
	import { toast } from "svelte-sonner"
	import * as v from "valibot"

	let peers: MdnsPeers = $state({})
	let dragging = $state(false)
	let files: string[] = $state([])
	let unlistenReq: UnlistenFn

	onMount(async () => {
		peers = await getPeers()
		unlistenReq = await listen<FileTransferPayload>("file-transfer-request", async (e) => {
			console.log(e)
			const confirmed = await confirm(`Download file? ${e.payload.filename}`)
			if (!confirmed) return
			console.log("confirmed", e.payload.filename, e.payload.code)

			const downloadPath = await path.join(await path.downloadDir(), e.payload.filename)
			console.log("downloadPath", downloadPath)

			downloadFile(
				e.payload.code,
				downloadPath,
				e.payload.sslCert,
				`https://${e.payload.ip}:${e.payload.port}/download-file`
			)
				.then(() => {
					console.log("downloaded")
					toast.success(`Downloaded ${e.payload.filename}`)
				})
				.catch((err) => {
					toast.error(`Error downloading ${e.payload.filename}: ${err.message}`)
				})
			// const headers = new Map()
			// headers.set("Authorization", e.payload.code)
			// download(
			// 	"https://localhost:9559/download-file",
			// 	downloadPath,
			// 	(progress) => {
			// 		console.log(progress)
			// 	},
			// 	headers
			// )
		})
	})

	onDestroy(async () => {
		unlistenReq()
	})

	const onDrop: EventCallback<{ paths: string[] }> = async (e) => {
		// keep only files not dirs
		const filesStats = await Promise.all(e.payload.paths.map((p) => fs.stat(p)))
		// keep only files based on stats
		const filesPaths = e.payload.paths.filter((p, i) => filesStats[i].isFile)
		files = Array.from(new Set([...files, ...filesPaths]))

		dragging = false
	}

	function sendFile(peer: MdnsServiceInfo, files: string[]) {
		console.log(peer, files)
		localNetSendFile(peer.addresses[0], peer.port, peer.sslCert, files)
	}
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" class="fixed left-2 top-2 z-50" onclick={goBack}>
	<ArrowLeftIcon class="h-4 w-4" />
</Button>
<div class="h-12" data-tauri-drag-region></div>
<Layouts.Center>
	<DragNDrop {onDrop} onEnter={() => (dragging = true)} onCancelled={() => (dragging = false)}>
		<Card.Root
			class={cn("h-36 w-96", dragging ? "border-lime-400/30" : "text-white hover:text-blue-200")}
		>
			<button class="flex h-full w-full cursor-pointer items-center justify-center">
				<div class={cn("flex flex-col items-center", dragging ? "text-lime-400/70" : "")}>
					<IconMultiplexer icon={{ value: "mdi:file", type: IconEnum.Iconify }} class="h-10 w-10" />
					<small class="select-none font-mono text-xs">Drag and Drop</small>
					<small class="select-none font-mono text-xs">File To Send</small>
				</div>
			</button>
		</Card.Root>
	</DragNDrop>
</Layouts.Center>
<!-- <pre>{JSON.stringify(peers, null, 2)}</pre> -->
<div class="container">
	<ul>
		{#each files as file}
			<li>{file}</li>
		{/each}
	</ul>
	<Table.Root>
		<Table.Caption>A list of your recent invoices.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">Hostname</Table.Head>
				<Table.Head>Addreess</Table.Head>
				<Table.Head>Port</Table.Head>
				<Table.Head class="text-right">Send</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each Object.values(peers) as peer}
				<Table.Row>
					<Table.Cell class="font-medium">{peer.hostname}</Table.Cell>
					<Table.Cell>{peer.addresses[0]}</Table.Cell>
					<Table.Cell>{peer.port}</Table.Cell>
					<Table.Cell class="text-right">
						<Button
							variant="outline"
							size="icon"
							onclick={() => {
								sendFile(peer, files)
							}}
						>
							<SendIcon class="h-4 w-4" />
						</Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
