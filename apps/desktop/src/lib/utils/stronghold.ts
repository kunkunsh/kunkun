import { invoke } from "@tauri-apps/api/core"
import { Client, Store, Stronghold } from "@tauri-apps/plugin-stronghold"

/**
 * @returns Stronghold Encryption Key Stored in Keyring
 */
export function getStrongholdKey() {
	return invoke<string>("get_stronghold_key")
}

export class KunkunStronghold {
	private stronghold: Stronghold | undefined
	private client: Client | undefined
	private store: Store | undefined
	private vaultPath: string
	private clientName: string

	constructor(vaultPath: string, clientName: string) {
		this.vaultPath = vaultPath
		this.clientName = clientName
	}

	async init() {
		console.log("init debug 1")
		const key = await getStrongholdKey()
		console.log("init debug 2", this.vaultPath, "vault password")
		this.stronghold = await Stronghold.load(this.vaultPath, "vault password")
		console.log("init debug 3")
		try {
			this.client = await this.stronghold.loadClient(this.clientName)
		} catch (error) {
			this.client = await this.stronghold.createClient(this.clientName)
		}
		console.log("init debug 4")
		this.store = this.client?.getStore()
	}

	insertRecord(key: string, value: string) {
		const data = Array.from(new TextEncoder().encode(value))
		return this.store?.insert(key, data)
	}

	async getRecord(key: string) {
		const data = await this.store?.get(key)
		if (!data) return null
		return new TextDecoder().decode(new Uint8Array(data))
	}

	removeRecord(key: string) {
		return this.store?.remove(key)
	}

	save() {
		return this.stronghold?.save()
	}
}
