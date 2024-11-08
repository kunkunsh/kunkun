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
	toast,
	ui,
	WorkerExtension
} from "@kksh/api/ui/worker"

class ExtensionTemplate extends WorkerExtension {
	async onFormSubmit(value: Record<string, any>): Promise<void> {
		console.log("Form submitted", value)
		toast.success(`Form submitted: ${JSON.stringify(value)}`)
	}
	async load() {
		const form = new Form.Form({
			title: "Form 1",
			key: "form1",
			submitBtnText: "Download",
			fields: [
				new Form.DateField({
					key: "birthday",
					label: "Date of Birth",
					hideLabel: false,
					description: "Enter your date of birth"
				}),
				new Form.NumberField({
					key: "age",
					label: "Age",
					default: 18,
					placeholder: "Enter your age",
					optional: true,
					description: "Enter your age"
				}),
				new Form.InputField({
					key: "name",
					label: "Name",
					default: "Huakun"
				}),
				new Form.InputField({
					key: "name2",
					label: "Name 2"
				}),
				new Form.BooleanField({
					key: "isActive",
					label: "Is Active",
					description: "Is the user active?"
				}),
				new Form.SelectField({
					key: "gender",
					label: "Gender",
					options: ["Male", "Female", "Other"],
					description: "Select your gender"
				})
			]
		})
		console.log(form)
		console.log(form.toModel())
		return ui.render(form)
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
