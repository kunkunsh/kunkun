import { describe, expect, test } from "bun:test"
import { minimatch } from "minimatch"
import { translateScopeToPath } from "../../../utils/path"

test("minimatch", () => {
	// console.log(minimatch("/desktop/newbi/bar.foo", "/desktop/**/*.foo"))
	// console.log("$DESKTOP/newbi/bar.foo".split("/"))
	// find the first slash of "$DESKTOP/newbi/bar.foo"
})
