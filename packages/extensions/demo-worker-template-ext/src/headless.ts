import { expose, HeadlessCommand, toast } from "@kksh/api/headless"

class DemoHeadlessExt extends HeadlessCommand {
	load(): Promise<void> {
		console.log("Demo Headless Extension Loaded")
		toast.info("Demo Headless Extension Loaded")
		return Promise.resolve()
	}
}
expose(new DemoHeadlessExt())
