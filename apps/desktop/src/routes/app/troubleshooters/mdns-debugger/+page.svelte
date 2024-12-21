<script lang="ts">
	import { goBackOnEscape } from "@/utils/key.js"
	import { goBack } from "@/utils/route"
	import { getPeers } from "@kksh/api/commands"
	import type { MdnsPeers } from "@kksh/api/models"
	import { Button } from "@kksh/svelte5"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { onMount } from "svelte"

	let peers: MdnsPeers = $state({})

	async function refreshPeers() {
		console.log("refreshPeers")
		peers = await getPeers()
		console.log("peers", peers)
	}

	onMount(async () => {
		await refreshPeers()
	})
</script>

<div class="h-10" data-tauri-drag-region></div>
<main class="container">
	<Button onclick={refreshPeers}>Refresh mDNS Peers</Button>
	<pre>{JSON.stringify(peers, null, 2)}</pre>
</main>
