import { compressToBase64, decompressFromBase64 } from "lz-string"

/**
 * This file contains the deserialization and compression functions I designed for the grid animation.
 */

export function deserializeFrame(frameStr: string): number[][] {
	// Convert string to 2D array. "o" is 0, "l" is 255. Each line is separated by '\n'
	return frameStr.split("\n").map((row) => Array.from(row).map((char) => (char === "o" ? 0 : 1)))
}

export function decompressFrame(compressedFrame: string): string {
	// Each char can be "o" or "l". Compress consecutive same char to a number followed by the char.
	let decompressed = []
	let count = ""
	for (let char of compressedFrame) {
		if (!isNaN(parseInt(char))) {
			count += char
		} else {
			if (count) {
				decompressed.push(char.repeat(parseInt(count)))
				count = ""
			} else {
				decompressed.push(char)
			}
		}
	}
	return decompressed.join("")
}

// this is simple re-export of lz-string, the purpose is to make it easy to swap to another compression algorithm later without changing other code
export const compressString = compressToBase64
export const decompressString = decompressFromBase64
