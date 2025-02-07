import { clipboard, expose, HeadlessCommand, toast } from "@kksh/api/headless"
import { v4 as uuidv4 } from "uuid"

class UuidExt extends HeadlessCommand {
	async load() {
		const uuid = uuidv4()
		return clipboard
			.writeText(uuid)
			.then(() => {
				toast.success(`Copied UUID: ${uuid}`)
			})
			.catch((err) => {
				toast.error(`Failed to copy UUID: ${err}`)
			})
	}
}

expose(new UuidExt())
