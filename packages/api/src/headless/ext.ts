export abstract class HeadlessCommand {
	/**
	 * Load the extension. Initialize the extension.
	 * Will be called once when the extension is first loaded.
	 */
	abstract load(): Promise<void>
}
