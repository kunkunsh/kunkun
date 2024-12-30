<script lang="ts">
	import "../app.css"
	import { ModeWatcher, ThemeWrapper } from "@kksh/svelte5"
	import { appDataDir } from "@tauri-apps/api/path"
	import { Client, Stronghold } from "@tauri-apps/plugin-stronghold"
	import { onMount } from "svelte"

	const initStronghold = async () => {
		const vaultPath = `${await appDataDir()}/vault.hold`
		const vaultPassword = "vault password"
		const stronghold = await Stronghold.load(vaultPath, vaultPassword)

		let client: Client
		const clientName = "name your client"
		try {
			client = await stronghold.loadClient(clientName)
		} catch {
			client = await stronghold.createClient(clientName)
		}

		return {
			stronghold,
			client
		}
	}

	async function insertRecord(store: any, key: string, value: string) {
		const data = Array.from(new TextEncoder().encode(value))
		await store.insert(key, data)
	}

	async function getRecord(store: any, key: string): Promise<string> {
		const data = await store.get(key)
		return new TextDecoder().decode(new Uint8Array(data))
	}

	onMount(async () => {
		const { stronghold, client } = await initStronghold()
		console.log(stronghold, client)
		const store = client.getStore()
		const key = "my_key"
		insertRecord(store, key, "secret value")
		const value = await getRecord(store, key)
		console.log(value) // 'secret value'
		await stronghold.save()
	})

	let { children } = $props()
</script>

<ModeWatcher />
<ThemeWrapper>
	{@render children()}
</ThemeWrapper>
