<script lang="ts">
	import Icon from "@iconify/svelte"
	import { Action as ActionSchema } from "@kksh/api/models"
	import { Button, ButtonModule, Command, Input, Label, Popover } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import { Check, ChevronsUpDown } from "lucide-svelte"
	import { tick } from "svelte"
	import Kbd from "../common/Kbd.svelte"

	let {
		actionPanel,
		open = $bindable(false),
		onActionSelected
	}: {
		actionPanel?: ActionSchema.ActionPanel
		open?: boolean
		onActionSelected?: (value: string) => void
	} = $props()

	let value = $state("")
	let triggerRef = $state<HTMLButtonElement>(null!)

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false
		tick().then(() => {
			triggerRef.focus()
		})
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button variant="ghost" class="" {...props} role="combobox" aria-expanded={open}>
				Actions
				<span class="flex items-center gap-0.5" data-tauri-drag-region>
					<Kbd><Icon icon="ph-command" class="h-4 w-4 shrink-0" /></Kbd>
					<Kbd>K</Kbd>
				</span>
				<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-64 p-0">
		<Command.Root>
			<Command.Input placeholder="Select an Action" />
			<Command.List>
				<Command.Empty>No action found.</Command.Empty>
				<Command.Group>
					{#each actionPanel?.items ?? [] as action}
						<Command.Item
							value={action.value}
							onSelect={() => {
								value = action.value
								closeAndFocusTrigger()
								onActionSelected?.(action.value)
							}}
						>
							{action.title}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
