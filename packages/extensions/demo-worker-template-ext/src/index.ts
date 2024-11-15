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
	security,
	shell,
	toast,
	ui,
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

	async onEnterPressedOnSearchBar(): Promise<void> {
		console.log("Enter pressed on search bar")
	}

	async load() {
		// console.log("Check screen capture permission:", await security.mac.checkScreenCapturePermission())
		// await security.mac.revealSecurityPane("AllFiles")
		// console.log(await security.mac.verifyFingerprint())
		ui.setSearchBarPlaceholder("Search for items")
		ui.showLoadingBar(true)
		setTimeout(() => {
			ui.showLoadingBar(false)
		}, 2000)
		const { rpcChannel, process, command } = await shell.createDenoRpcChannel<
			{},
			{
				add(a: number, b: number): Promise<number>
				subtract(a: number, b: number): Promise<number>
				// readImageMetadata(path: string): Promise<any>
			}
		>(
			"$EXTENSION/deno-src/rpc.ts",
			[],
			{
				allowEnv: ["npm_package_config_libvips"],
				// allowAllEnv: true,
				// allowFfi: ["*sharp-darwin-arm64.node"],
				allowAllFfi: true,
				allowAllRead: true,
				allowAllSys: true,
				// allowRun: ["*exiftool"]
				allowAllRun: true
			},
			{}
		)
		// const child = new Child(process.pid)
		command.stdout.on("data", (data) => {
			console.log("stdout", data.toString())
		})
		command.stderr.on("data", (data) => {
			console.log("stderr", data.toString())
		})
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
		const list = new List.List({
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
					new Markdown(`
# Hello World
<img src="https://github.com/huakunshen.png" />
<img src="https://github.com/huakunshen.png" />
<img src="https://github.com/huakunshen.png" />
							`)
				],
				width: 50
			}),
			actions: new Action.ActionPanel({
				items: [
					new Action.Action({
						title: "Action 1",
						value: "action 1",
						icon: new Icon({ type: IconType.enum.Iconify, value: "material-symbols:add-reaction" })
					}),
					new Action.Action({ title: "Action 2", value: "action 2" }),
					new Action.Action({ title: "Action 3", value: "action 3" }),
					new Action.Action({ title: "Action 4", value: "action 4" })
				]
			})
		})

		return ui.render(list)
	}

	async onSearchTermChange(term: string): Promise<void> {
		return ui.render(
			new List.List({
				// items: allItems.filter((item) => item.title.toLowerCase().includes(term.toLowerCase())),
				inherits: ["items", "sections"],
				defaultAction: "Top Default Action",
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
