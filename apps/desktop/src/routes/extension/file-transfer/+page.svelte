<script lang="ts">
	import DragNDrop from "@/components/common/DragNDrop.svelte"
	import { cn } from "@/utils"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import {
		downloadFile,
		getAllFileTransferBuckets,
		getPeers,
		localNetSendFile
	} from "@kksh/api/commands"
	import {
		FileNode,
		FileTransferPayload,
		IconEnum,
		MdnsServiceInfo,
		type MdnsPeers
	} from "@kksh/api/models"
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

	async function getAllBuckets() {
		const allBuckets = await getAllFileTransferBuckets()
		console.log(allBuckets)
	}

	async function downloadFileNode(
		node: FileNode,
		dir: string,
		code: string,
		sslCert: string,
		ip: string,
		port: string
	) {
		if (node.type === 1) {
			// directory
			if (node.filename === "") {
				const timestamp = new Date()
					.toISOString()
					.slice(0, 19)
					.replace("T", " ")
					.replaceAll(":", "-")
					.replace(" ", "-")
				node.filename = timestamp
			}
			const downloadPath = await path.join(dir, node.filename)
			await fs.mkdir(downloadPath, { recursive: true })
			await Promise.all(
				node.children.map((child) => downloadFileNode(child, downloadPath, code, sslCert, ip, port))
			)
		} else if (node.type === 0) {
			// file
			const downloadPath = await path.join(dir, node.filename)
			downloadFile(code, downloadPath, sslCert, `https://${ip}:${port}/download-file?id=${node.id}`)
				.then(() => {
					console.log("downloaded")
					toast.success(`Downloaded ${node.filename}`)
				})
				.catch((err) => {
					console.error(err)
					toast.error(`Error downloading ${node.filename}: ${err.message}`)
				})
		} else {
			console.error("Invalid file type", node.type)
		}
	}

	onMount(async () => {
		peers = await getPeers()
		unlistenReq = await listen<FileTransferPayload>("file-transfer-request", async (e) => {
			console.log(e)
			const confirmed = await confirm(`Download files?`)
			if (!confirmed) return
			console.log("confirmed", e.payload.root, e.payload.code)
			// const root = e.payload.root
			downloadFileNode(
				e.payload.root,
				await path.downloadDir(),
				e.payload.code,
				e.payload.sslCert,
				e.payload.ip,
				e.payload.port
			)
			// root.children.forEach(async (child) => {
			// child.filename
			// download(
			// 	`https://${e.payload.ip}:${e.payload.port}/download-file`,
			// 	await path.join(await path.downloadDir(), child.filename),
			// 	(progress) => {
			// 		console.log(progress)
			// 	},
			// 	new Map([
			// 		["Authorization", e.payload.code],
			// 		["file_id", child.id]
			// 	])
			// )
			// get current time in yyyy-mm-dd-hh-mm-ss format

			// const timestamp = new Date().toISOString().replace(/[-:Z]/g, "")
			// const tmpDownloadFolder = await path.join(await path.downloadDir(), timestamp)
			// await fs.mkdir(tmpDownloadFolder, { recursive: true })
			// downloadFile(
			// 	e.payload.code,
			// 	await path.join(tmpDownloadFolder, child.filename),
			// 	e.payload.sslCert,
			// 	`https://${e.payload.ip}:${e.payload.port}/download-file?id=${child.id}`
			// )
			// 	.then(() => {
			// 		console.log("downloaded")
			// 		toast.success(`Downloaded ${child.filename}`)
			// 	})
			// 	.catch((err) => {
			// 		console.error(err)
			// 		toast.error(`Error downloading ${child.filename}: ${err.message}`)
			// 	})
			// })
			// const downloadPath = await path.join(await path.downloadDir(), e.payload.filename)
			// console.log("downloadPath", downloadPath)

			// downloadFile(
			// 	e.payload.code,
			// 	downloadPath,
			// 	e.payload.sslCert,
			// 	`https://${e.payload.ip}:${e.payload.port}/download-file`
			// )
			// 	.then(() => {
			// 		console.log("downloaded")
			// 		toast.success(`Downloaded ${e.payload.filename}`)
			// 	})
			// 	.catch((err) => {
			// 		toast.error(`Error downloading ${e.payload.filename}: ${err.message}`)
			// 	})
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
		// const filesPaths = e.payload.paths.filter((p, i) => filesStats[i].isFile)
		files = Array.from(new Set([...files, ...e.payload.paths]))

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
	<Button onclick={getAllBuckets}>Get All Buckets</Button>
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
