import { expose } from "@kunkun/api/runtime/deno"

export interface API {
	add(a: number, b: number): Promise<number>
	subtract(a: number, b: number): Promise<number>
}

// Define your API methods
export const apiMethods: API = {
	add: async (a: number, b: number) => a + b,
	subtract: async (a: number, b: number) => a - b
}
expose(apiMethods)
