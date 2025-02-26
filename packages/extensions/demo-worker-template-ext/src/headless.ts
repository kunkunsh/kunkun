import { expose, HeadlessCommand, shell, toast } from "@kksh/api/headless"

class DemoHeadlessExt extends HeadlessCommand {
	load(): Promise<void> {
		shell.killPid(84812)
		return Promise.resolve()
	}
}
expose(new DemoHeadlessExt())
