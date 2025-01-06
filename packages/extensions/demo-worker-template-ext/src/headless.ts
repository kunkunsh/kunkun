import { expose, HeadlessWorkerExtension, toast } from "@kksh/api/headless"

class DemoHeadlessExt extends HeadlessWorkerExtension {
	load(): Promise<void> {
		console.log("Demo Headless Extension Loaded")
		toast.info("Demo Headless Extension Loaded")
		return Promise.resolve()
	}
}
expose(new DemoHeadlessExt())
