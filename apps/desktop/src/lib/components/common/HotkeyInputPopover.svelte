<script lang="ts">
	import { cn } from "@/utils"
	import { keyCombToDisplay } from "@/utils/js"
	import { ButtonModule, Input, Label, Popover } from "@kksh/svelte5"
	import HotkeyInput from "./HotkeyInput.svelte"

	let {
		class: className,
		savedHotkey,
		onSubmit
	}: { class?: string; savedHotkey: string[]; onSubmit: (keys: string[]) => void } = $props()
	let recording = $state(false)
	let keys = $state<string[]>([])
	function onRecordClicked() {
		keys = []
		recording = true
	}
	let open = $state(false)
	let inputRef = $state<HTMLInputElement | null>(null)
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		onclick={onRecordClicked}
		class={cn(ButtonModule.buttonVariants({ variant: "outline", size: "sm" }), className)}
	>
		<!-- <button>recording: {recording}</button> -->
		{#if savedHotkey.length === 0}
			<span>Record Hotkey</span>
		{:else}
			<span>{keyCombToDisplay(savedHotkey)}</span>
		{/if}
	</Popover.Trigger>
	<Popover.Content
		class="w-60"
		onOpenAutoFocus={(e: FocusEvent) => {
			e.preventDefault()
			console.log("inputRef", inputRef)
			// inputRef?.focus()
		}}
	>
		<HotkeyInput
			onSubmit={(keys) => {
				open = false
				onSubmit(keys)
			}}
		/>
	</Popover.Content>
</Popover.Root>
