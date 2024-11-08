import type { RPCChannel } from "@hk/comlink-stdio/browser"
import {
	Action,
	app,
	Child,
	expose,
	Form,
	fs,
	Icon,
	IconEnum,
	List,
	Markdown,
	open,
	path,
	shell,
	toast,
	ui,
	security,
	WorkerExtension
} from "@kksh/api/ui/worker"
import { IconType } from "@kunkun/api/models"

const nums = Array.from({ length: 20 }, (_, i) => i + 1)
const categories = ["Suggestion", "Advice", "Idea"]
const itemsTitle = nums.map((n) => categories.map((c) => `${c} ${n}`)).flat()
const allItems: List.Item[] = itemsTitle.map(
	(title) =>
		new List.Item({
			title,
			value: title,
			defaultAction: "Item Default Action"
		})
)

class ExtensionTemplate extends WorkerExtension {
	async onBeforeGoBack() {
		console.log("onBeforeGoBack")
		// console.log(`Try killing pid: ${this.apiProcess?.pid}`)
		// await this.apiProcess?.kill()
		// console.log("apiProcess killed")
	}
	async onFormSubmit(value: Record<string, any>): Promise<void> {
		console.log("Form submitted", value)
	}

	async load() {
		// console.log("Check screen capture permission:", await security.mac.checkScreenCapturePermission())
		// await security.mac.revealSecurityPane("AllFiles")
		// console.log(await security.mac.verifyFingerprint())
		ui.showLoadingBar(true)
		setTimeout(() => {
			ui.showLoadingBar(false)
		}, 2000)
		const { rpcChannel, process } = await shell.createDenoRpcChannel<
			{},
			{
				add(a: number, b: number): Promise<number>
				subtract(a: number, b: number): Promise<number>
			}
		>("$EXTENSION/deno-src/rpc.ts", [], {}, {})
		const api = rpcChannel.getApi()
		await api.add(1, 2).then(console.log)
		await api.subtract(1, 2).then(console.log)
		await process.kill()
		const extPath = await path.extensionDir()
		// console.log("Extension path:", extPath)
		const tagList = new List.ItemDetailMetadataTagList({
			title: "Tag List Title",
			tags: [
				new List.ItemDetailMetadataTagListItem({
					text: "red",
					color: "#ff0000"
				}),
				new List.ItemDetailMetadataTagListItem({
					text: "yellow",
					color: "#ffff00"
				})
			]
		})

		return ui.render(
			new List.List({
				items: allItems,
				defaultAction: "Top Default Action",
				detail: new List.ItemDetail({
					children: [
						new List.ItemDetailMetadata([
							new List.ItemDetailMetadataLabel({
								title: "Label Title",
								text: "Label Text"
							}),
							new List.ItemDetailMetadataLabel({
								title: "Label Title",
								text: "Label Text",
								icon: new Icon({
									type: IconType.enum.Iconify,
									value: "mingcute:appstore-fill"
								})
							}),
							new List.ItemDetailMetadataSeparator(),
							new List.ItemDetailMetadataLabel({
								title: "Label Title",
								text: "Label Text"
							}),
							new List.ItemDetailMetadataLink({
								title: "Link Title",
								text: "Link Text",
								url: "https://github.com/huakunshen"
							}),
							new List.ItemDetailMetadataLabel({
								title: "Label Title",
								text: "Label Text"
							}),
							tagList
						]),
// 						new Markdown(`
// <img src="https://github.com/huakunshen.png" />
// <img src="https://github.com/huakunshen.png" />
// <img src="https://github.com/huakunshen.png" />
// 										`)
					],
					width: 70
				})
			})
		)
	}

	async onSearchTermChange(term: string): Promise<void> {
		console.log("Search term changed to:", term)
		return ui.render(
			new List.List({
				// items: allItems.filter((item) => item.title.toLowerCase().includes(term.toLowerCase())),
				inherits: ["items", "sections"],
				// defaultAction: "Top Default Action",
				detail: new List.ItemDetail({
					children: [
						new List.ItemDetailMetadata([
							new List.ItemDetailMetadataLabel({
								title: "Label Title",
								text: "Label Text"
							})
						])
						// 						new Markdown(`
						// ## Search results for "${term}"
						// <img src="https://github.com/huakunshen.png" />
						// <img src="https://github.com/huakunshen.png" />
						// <img src="https://github.com/huakunshen.png" />
						// 						`)
					],
					width: term.length > 3 ? 70 : 30
				})
			})
		)
	}

	async onListItemSelected(value: string): Promise<void> {
		console.log("Item selected:", value)
	}

	async onActionSelected(value: string): Promise<void> {
		console.log("Action selected:", value)
	}
}

expose(new ExtensionTemplate())
