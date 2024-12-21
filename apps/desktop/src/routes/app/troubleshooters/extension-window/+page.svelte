<script lang="ts">
	import { winExtMap } from "@/stores"
	import { goBackOnEscape, goBackOnEscapeClearSearchTerm } from "@/utils/key"
	import { goBack, goHome } from "@/utils/route"
	import { getExtLabelMap, unregisterExtensionWindow } from "@kksh/api/commands"
	import type { ExtensionLabelMap } from "@kksh/api/models"
	import { Button, Checkbox, ScrollArea } from "@kksh/svelte5"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { ArrowLeftIcon, TrashIcon } from "lucide-svelte"
	import { onMount } from "svelte"
	import { toast } from "svelte-sonner"

	const appWin = getCurrentWebviewWindow()
	let winLabelMap = $state<ExtensionLabelMap>({})
	let refreshEverySecond = $state(true)
	let refreshCount = $state(0)

	async function refresh() {
		const extLabelMap = await getExtLabelMap()
		winLabelMap = extLabelMap
		refreshCount++
	}

	function refreshWinLabelMapRecursively() {
		setTimeout(async () => {
			await refresh()
			if (refreshEverySecond) {
				refreshWinLabelMapRecursively()
			}
		}, 1000)
	}

	onMount(async () => {
		const extLabelMap = await getExtLabelMap()
		winLabelMap = extLabelMap
		refreshCount = 1
	})

	$effect(() => {
		if (refreshEverySecond) {
			refreshWinLabelMapRecursively()
		}
	})

	function unregisterWindow(label: string) {
		// winExtMap
		// 	.unregisterExtensionFromWindow(label)
		unregisterExtensionWindow(label)
			.then(() => {
				toast.success("Unregistered window")
			})
			.catch((err) => {
				toast.error("Failed to unregister window", { description: err.message })
			})
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			if (appWin.label === "main") {
				goHome()
			} else {
				appWin.close()
			}
		}
	}
</script>

<main class="container">
	<div class="flex items-center justify-between space-x-2">
		<div class="flex items-center space-x-2">
			<Checkbox id="refreshEverySecond" bind:checked={refreshEverySecond} />
			<label
				for="refreshEverySecond"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Refresh Every Second
			</label>
		</div>
		<span class="flex items-center space-x-2">
			<Button size="sm" onclick={refresh}>Refresh</Button>
			<span>Refreshed {refreshCount} times</span>
		</span>
	</div>
	<ScrollArea class="py-5" orientation="both">
		{#each Object.entries(winLabelMap) as [label, content]}
			<li>
				<span class="flex gap-2">
					<strong>Label:</strong>
					<pre class="text-lime">{label}</pre>
				</span>
				<ul class="pl-5">
					{#each Object.entries(content) as [key, value]}
						<li>
							<span class="flex gap-2">
								<strong>{key}:</strong>
								<pre class="text-lime">{value}</pre>
							</span>
						</li>
					{/each}
				</ul>
				<Button variant="destructive" size="icon" onclick={() => unregisterWindow(label)}>
					<TrashIcon />
				</Button>
			</li>
		{/each}
	</ScrollArea>
</main>
