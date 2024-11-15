import { image } from "@hk/photographer-toolbox"
import { expose } from "@kunkun/api/runtime/deno"

// import { image } from "jsr:@hk/photographer-toolbox@^0.1.3"

export interface API {
	add(a: number, b: number): Promise<number>
	subtract(a: number, b: number): Promise<number>
	// readImageMetadata: (path: string) => Promise<any>
	// readImageMetadata: typeof image.readImageMetadata
}

// Define your API methods
export const apiMethods: API = {
	add: async (a: number, b: number) => a + b,
	subtract: async (a: number, b: number) => a - b
	// readImageMetadata: (path: string) => Promise.resolve(`path + ${path}`)
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
