import { faker } from "@faker-js/faker"
import {
	Action,
	app,
	Child,
	clipboard,
	db,
	expose,
	Form,
	fs,
	helper,
	Icon,
	IconEnum,
	kv,
	List,
	Markdown,
	open,
	path,
	security,
	shell,
	TemplateUiCommand,
	toast,
	ui
} from "@kksh/api/ui/template"
import { IconType } from "@kunkun/api/models"

function generateId() {
	return Math.random().toString(36).substring(2, 15)
}

type Item = {
	id: string
	name: string
	description: string
}

type Section = {
	name: string
	items: Item[]
	sectionRef: HTMLDivElement | null
	sectionHeight: number
}

function getItems(n: number = 10): Item[] {
	return Array.from({ length: n }, () => ({
		id: generateId(),
		name: faker.person.fullName(),
		description: faker.lorem.sentence()
	}))
}

function getSections(n: number = 10): Section[] {
	return Array.from({ length: n }, () => ({
		name: faker.lorem.word(),
		items: getItems(3),
		sectionRef: null,
		sectionHeight: 0
	}))
}

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

class ExtensionTemplate extends TemplateUiCommand {
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
		return ui.render(
			new Markdown(`
# Hello World

[GitHub HuakunShen](https://github.com/HuakunShen)

![](https://github.com/huakunshen.png)

<img src="https://github.com/huakunshen.png" />

			`)
		)
		ui.setSearchBarPlaceholder("Search for items")
		const sections = getSections(2)
		const items = getItems(5)
		ui.showLoadingBar(true)
		const extPath = await path.extensionDir()
		const cmd = shell.createCommand("deno", ["run", "/Users/hk/Dev/kunkun/deno.ts"])
		cmd.stdout.on("data", (data) => {
			console.log("within ext stdout", data)
		})
		const child = await cmd.spawn()
		console.log("in ext child", child)
		setTimeout(() => {
			child
				.kill()
				.then(() => {
					console.log("child killed")
				})
				.catch((err) => {
					console.error("child kill error", err)
				})
		}, 5000)

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

[GitHub HuakunShen](https://github.com/HuakunShen)

![](https://github.com/huakunshen.png)

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
