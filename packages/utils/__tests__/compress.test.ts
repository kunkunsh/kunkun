import { expect, test } from "bun:test"
import { compress, decompress } from "lz-string"
import { compressString, decompressString } from "../src"

test("decompressString", async () => {
	const data = await fetch("https://dance.kunkun.sh/api/data").then((res) => res.text())
	expect(decompressString(compressString(data))).toBe(data)
})
