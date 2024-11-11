<script lang="ts">
	import { keyCodeToKey, keyCombToDisplay } from "@/utils/js"
	import { isShortcut } from "@/utils/key"
	import { Button, Input } from "@kksh/svelte5"
	import { cn } from "@kksh/svelte5/utils"
	import { onMount } from "svelte"

	let {
		// keys = $bindable([]),
		class: className,
		// ref = $bindable(null),
		// recording = $bindable(false),
		onSubmit
	}: {
		// keys?: string[] | null
		class?: string
		// recording?: boolean
		// ref?: HTMLInputElement | null
		onSubmit?: (keys: string[]) => void
	} = $props()
	let keys = $state<string[]>([])
	let recording = $state(false)
	let savedShortcut = $state<Set<string> | null>(null)
	let keyCombination = $derived(
		savedShortcut !== null
			? keyCombToDisplay(Array.from(savedShortcut))
			: keyCombToDisplay(keys ?? [])
	)
	let inputRef = $state<HTMLInputElement | null>(null)
	function onKeyDown(e: KeyboardEvent) {
		if (recording) {
			e.preventDefault()
			const newKeys = [...keys, keyCodeToKey(e.code)]
			keys = newKeys
			if (isShortcut(newKeys)) {
				//   console.log("shortcut detected", newKeys)
				savedShortcut = new Set(newKeys)
				recording = false // stop recording
			}
		}
	}

	function onKeyUp(e: KeyboardEvent) {
		e.preventDefault()
		if (recording) {
			keys = keys.filter((k) => k !== keyCodeToKey(e.code))
		}
	}

	onMount(() => {
		console.log(inputRef)
		inputRef?.focus()
		setTimeout(() => {
			inputRef?.focus()
		}, 100)
	})
</script>

<form
	class="flex flex-col gap-1"
	onsubmit={(e) => {
		e.preventDefault()
		onSubmit?.(Array.from(keys))
	}}
>
	<!-- <pre>recording: {recording}</pre> -->
	<Input
		value={keyCombination}
		class={cn("w-full text-center", className)}
		onkeydown={onKeyDown}
		autofocus
		bind:ref={inputRef}
		onkeyup={onKeyUp}
		onfocus={() => {
			recording = true
			keys = []
		}}
		onblur={() => (recording = false)}
	/>
	<Button size="sm" type="submit" variant="outline">Submit</Button>
</form>
