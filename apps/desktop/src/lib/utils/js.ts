export function setsEqual<T>(set1: Set<T>, set2: Set<T>) {
	if (set1.size !== set2.size) return false
	for (let item of set1) {
		if (!set2.has(item)) return false
	}
	return true
}

export const keyToDisplayMap: Record<string, string> = {
	" ": "Space",
	Enter: "↵",
	ArrowUp: "↑",
	ArrowDown: "↓",
	ArrowLeft: "←",
	ArrowRight: "→",
	Escape: "Esc",
	Meta: "⌘",
	Control: "Ctrl",
	Alt: "⌥",
	Shift: "⇧"
}

export function keyCodeToKey(keyCode: string): string {
	if (keyCode.startsWith("Key")) {
		return keyCode.slice(3)
	}
	if (keyCode.endsWith("Left")) {
		return keyCode.slice(0, -4)
	}
	if (keyCode.startsWith("Digit")) {
		return keyCode.slice(5)
	}
	if (keyCode.endsWith("Right")) {
		return keyCode.slice(0, -5)
	}
	return keyCode
}

export function keyToDisplay(keyCode: string): string {
	const mappedChar = keyToDisplayMap[keyCodeToKey(keyCode)]
	if (mappedChar) {
		return mappedChar
	} else {
		return keyCode
	}
}

export function keyCombToDisplay(keyComb: string[]): string {
	return keyComb.map(keyToDisplay).join("+")
}

export const modifierKeySet = new Set(["Meta", "Shift", "Alt", "Control"])
