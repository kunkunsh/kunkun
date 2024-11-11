<script lang="ts">
	import { goBackOnEscape } from "@/utils/key.js"
	import { goBack } from "@/utils/route"
	import { getPeers } from "@kksh/api/commands"
	import type { MdnsPeers } from "@kksh/api/models"
	import { Button } from "@kksh/svelte5"
	import { ArrowLeftIcon } from "lucide-svelte"

	async function refreshPeers() {
		const peers = await getPeers()
		data.peers = peers
	}
	let { data } = $props()
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" class="absolute left-2 top-2 z-50" onclick={goBack}>
	<ArrowLeftIcon class="h-4 w-4" />
</Button>
<div class="h-10" data-tauri-drag-region></div>
<main class="container">
	<Button onclick={refreshPeers}>Refresh mDNS Peers</Button>
	<pre>{JSON.stringify(data.peers, null, 2)}</pre>
</main>
