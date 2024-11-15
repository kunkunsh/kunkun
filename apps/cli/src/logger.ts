import chalk from "chalk"
import debug from "debug"

debug.enable("*")

export function printDivider(char: string = "=") {
	const divider = chalk.blue(char.repeat(process.stdout.columns))
	console.log(divider)
}

export default {
	debug: debug("debug"),
	info: debug("info"),
	warn: debug("warn"),
	error: debug("error"),
	printDivider
}
