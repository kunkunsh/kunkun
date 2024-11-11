export function getActiveElementNodeName(): string | undefined {
	return document.activeElement?.nodeName
}

export function isInputElement(element: HTMLElement): boolean {
	return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
}

export function isKeyboardEventFromInputElement(e: KeyboardEvent): boolean {
	return isInputElement(e.target as HTMLElement)
}
