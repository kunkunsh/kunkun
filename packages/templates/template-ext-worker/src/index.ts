import {
	Action,
	app,
	expose,
	Form,
	fs,
	Icon,
	IconEnum,
	List,
	path,
	shell,
	TemplateUiCommand,
	toast,
	ui
} from "@kksh/api/ui/template"

class ExtensionTemplate extends TemplateUiCommand {
	async onFormSubmit(value: Record<string, any>): Promise<void> {
		console.log("Form submitted", value)
		toast.success(`Form submitted: ${JSON.stringify(value)}`)
	}
	async load() {
		// setupI18n(await app.language())
		// console.log(t("welcome"))

		return ui.setSearchBarPlaceholder("Enter a search term, and press enter to search").then(() => {
			return ui.render(
				new List.List({
					sections: [
						new List.Section({
							title: "Section 1",
							items: [
								new List.Item({
									title: "Hello, World!",
									value: "Section 1 Hello, World!",
									icon: new Icon({ type: IconEnum.Iconify, value: "gg:hello" })
								}),
								new List.Item({ title: "Hello, World 2!", value: "Section 1 Hello, World 2!" })
							]
						}),
						new List.Section({
							title: "Section 2",
							items: [
								new List.Item({
									title: "Hello, World!",
									value: "Section 2 Hello, World!",
									icon: new Icon({ type: IconEnum.Iconify, value: "gg:hello" })
								}),
								new List.Item({ title: "Hello, World 2!", value: "Section 2 Hello, World 2!" })
							]
						})
					],
					items: [
						new List.Item({
							title: "Hello, World!",
							value: "Hello, World!",
							icon: new Icon({ type: IconEnum.Iconify, value: "ri:star-s-fill" })
						}),
						new List.Item({
							title: "Hello, World 2!",
							value: "Hello, World 2!",
							icon: new Icon({ type: IconEnum.Iconify, value: "gg:hello" }),
							actions: new Action.ActionPanel({
								items: [
									new Action.Action({
										title: "Open",
										icon: new Icon({ type: IconEnum.Iconify, value: "ion:open-outline" }),
										value: "open"
									})
								]
							})
						})
					]
				})
			)
		})
		return ui.render(
			new Form.Form({
				key: "form1",
				fields: [
					new Form.NumberField({
						key: "age",
						label: "Age",
						placeholder: "Enter your age"
					})
					// new Form.NumberField({
					// 	key: "age"
					// }),
					// new Form.Form({
					// 	key: "random",
					// 	fields: [
					// 		new Form.BooleanField({ key: "Server On" }),
					// 		new Form.ArrayField({
					// 			key: "birthday",
					// 			content: new Form.DateField({ key: "birthday" })
					// 		})
					// 	]
					// })
				]
			})
		)
	}

	async onActionSelected(actionValue: string): Promise<void> {
		switch (actionValue) {
			case "open":
				break

			default:
				break
		}
	}

	onSearchTermChange(term: string): Promise<void> {
		console.log("Search term changed to:", term)
		return Promise.resolve()
	}

	onListItemSelected(value: string): Promise<void> {
		console.log("Item selected:", value)
		return Promise.resolve()
	}
}

expose(new ExtensionTemplate())
