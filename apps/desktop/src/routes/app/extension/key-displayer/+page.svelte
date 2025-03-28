<script lang="ts">
	import { cn } from "@/utils"
	import { goBackOrCloseOnEscape } from "@/utils/key"
	import { setTransparentTitlebar } from "@kksh/api/commands"
	import { Button } from "@kksh/svelte5"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { ArrowBigUpIcon, ChevronUpIcon, CommandIcon, OptionIcon } from "lucide-svelte"
	import * as userInput from "tauri-plugin-user-input-api"
	import { type InputEvent } from "tauri-plugin-user-input-api"

	let { data } = $props()

	const SymbolMap = {
		Alt: "⎇",
		AltGr: "⌥",
		Backspace: "⌫",
		CapsLock: "⇪",
		ControlLeft: "⌃",
		ControlRight: "⌃",
		Delete: "⌦",
		DownArrow: "↓",
		End: "↘",
		Escape: "⎋",
		Home: "↖",
		LeftArrow: "←",
		MetaLeft: "⌘",
		MetaRight: "⌘",
		PageDown: "⇟",
		PageUp: "⇞",
		Return: "↩",
		RightArrow: "→",
		ShiftLeft: "⇧",
		ShiftRight: "⇧",
		Space: "␣",
		Tab: "⇥",
		UpArrow: "↑",
		PrintScreen: "PrtSc",
		ScrollLock: "ScrLk",
		Pause: "⎉",
		BackQuote: "`",
		Minus: "-",
		Equal: "=",
		LeftBracket: "[",
		RightBracket: "]",
		SemiColon: ";",
		Quote: "'",
		BackSlash: "\\",
		IntlBackslash: "\\",
		Comma: ",",
		Dot: ".",
		Slash: "/",
		Insert: ""
	}
	const MAX_QUEUE_SIZE = 20
	let keys = $state<string[]>([])
	let modifiers = $state({
		shift: false,
		ctrl: false,
		alt: false,
		meta: false
	})

	function handleKeyPress(evt: InputEvent) {
		if (!evt.key) return
		if (SymbolMap[evt.key as keyof typeof SymbolMap]) {
			keys = [...keys, SymbolMap[evt.key as keyof typeof SymbolMap]]
		}
		if (evt.key.startsWith("Shift")) {
			modifiers = { ...modifiers, shift: true }
		} else if (evt.key.startsWith("Control")) {
			modifiers = { ...modifiers, ctrl: true }
		} else if (evt.key.startsWith("Alt")) {
			modifiers = { ...modifiers, alt: true }
		} else if (evt.key.startsWith("Meta")) {
			modifiers = { ...modifiers, meta: true }
		} else if (evt.key.startsWith("Key") || evt.key.startsWith("Num")) {
			keys = [...keys, evt.key.slice(3)]
		} else if (evt.key === "Space") {
			keys = [...keys, "\u1680"]
		} else if (evt.key.startsWith("F")) {
			keys = [...keys, evt.key]
		}
		keys = keys.slice(-MAX_QUEUE_SIZE)
	}

	$inspect(keys)

	function handleKeyRelease(evt: InputEvent) {
		if (!evt.key) return
		if (evt.key.startsWith("Shift")) {
			modifiers = { ...modifiers, shift: false }
		} else if (evt.key.startsWith("Control")) {
			modifiers = { ...modifiers, ctrl: false }
		} else if (evt.key.startsWith("Alt")) {
			modifiers = { ...modifiers, alt: false }
		} else if (evt.key.startsWith("Meta")) {
			modifiers = { ...modifiers, meta: false }
		}
	}

	$effect(() => {
		data.win?.show().then(() => data.win?.setFocus())

		userInput.setEventTypes([userInput.EventTypeEnum.KeyPress, userInput.EventTypeEnum.KeyRelease])
		userInput.startListening((evt: InputEvent) => {
			switch (evt.eventType) {
				case userInput.EventTypeEnum.KeyPress:
					handleKeyPress(evt)
					break
				case userInput.EventTypeEnum.KeyRelease:
					handleKeyRelease(evt)
					break
				default:
					break
			}
		})

		return () => {
			userInput.stopListening()
		}
	})
</script>

<svelte:window on:keydown={goBackOrCloseOnEscape} />
<div class="absolute h-screen w-screen" data-tauri-drag-region></div>
<main class="flex h-screen w-screen flex-col overflow-hidden p-1">
	<div class="flex grow items-center px-2">
		<div class="flex w-full justify-end overflow-x-hidden text-3xl font-bold tracking-[0.5rem]">
			{#each keys as key, idx}
				<span class={cn({ "text-white/[0.7]": idx !== keys.length - 1 })}>{key}</span>
			{/each}
		</div>
	</div>
	<!-- <pre>{keys}</pre> -->
	<div class="flex justify-center space-x-2">
		<Button variant={modifiers.shift ? "default" : "outline"} size="icon"><ArrowBigUpIcon /></Button
		>
		<Button variant={modifiers.ctrl ? "default" : "outline"} size="icon"><ChevronUpIcon /></Button>
		<Button variant={modifiers.meta ? "default" : "outline"} size="icon"><CommandIcon /></Button>
		<Button variant={modifiers.alt ? "default" : "outline"} size="icon"><OptionIcon /></Button>
	</div>
</main>
