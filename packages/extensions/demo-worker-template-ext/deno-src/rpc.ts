import { image } from "@hk/photographer-toolbox"
import { expose } from "@kunkun/api/runtime/deno"

// import { image } from "jsr:@hk/photographer-toolbox@^0.1.3"

const files = [
	"/Users/hacker/Dev/projects/photographer-lib-deno/data/DSC03635.JPG"
	// "/Users/hacker/Dev/projects/photographer-lib-deno/data/IMG_3181.HEIC",
	// "/Users/hacker/Dev/projects/photographer-lib-deno/data/DJI_20241002175820_0054_D.JPG",
	// "/Users/hacker/Dev/projects/photographer-lib-deno/data/DJI_20241002175651_0051_D.DNG",
	// "/Users/hacker/Dev/projects/photographer-lib-deno/data/DSC03635.ARW"
]

export interface API {
	add(a: number, b: number): Promise<number>
	subtract(a: number, b: number): Promise<number>
	readImageMetadata: (path: string) => Promise<any>
	batchReadImageMetadata: (paths: string[]) => Promise<any[]>
	// readImageMetadata: typeof image.readImageMetadata
}

// Define your API methods
export const apiMethods: API = {
	add: async (a: number, b: number) => a + b,
	subtract: async (a: number, b: number) => a - b,
	readImageMetadata: async (path: string) => {
		console.error("readImageMetadata", path.trim())
		const metadata = await image.readImageMetadata(path.trim())
		console.error("metadata", metadata)
		return metadata
	},
	batchReadImageMetadata: async (paths: string[]) => {
		console.error("batchReadImageMetadata", paths)
		const metadata = await image.batchReadImageMetadata(paths)
		// console.error("metadata", metadata)
		return metadata
	}
	// readImageMetadata: image.readImageMetadata
}
expose(apiMethods)
// image
// 	.readImageMetadata(
// 		"/Users/hacker/Dev/projects/photographer-lib-deno/data/DJI_20241002175820_0054_D.JPG"
// 	)
// 	.then(console.log)
/**
 * env: npm_package_config_libvips
 * ffi: sharp-darwin-arm64.node
 * sys: cpus
 * read: exists /usr/bin/perl
 * Run: /Users/hacker/Library/Caches/deno/npm/registry.npmjs.org/exiftool-vendored.pl/12.96.0/bin/exiftool
 */
