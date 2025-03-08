<script lang="ts">
	import Icon from "@iconify/svelte"
	import { Action as ActionSchema } from "@kksh/api/models"
	import { Button, Command, Popover } from "@kksh/svelte5"
	import { ChevronsUpDown } from "lucide-svelte"
	import { IconMultiplexer } from "../common"
	import Kbd from "../common/Kbd.svelte"

	const isMac = navigator.platform.toLowerCase().includes("mac")

	let {
		actionPanel,
		open = $bindable(false),
		onActionSelected,
		onBlur
	}: {
		actionPanel?: ActionSchema.ActionPanel
		open?: boolean
		onActionSelected?: (value: string) => void
		onBlur?: () => void
	} = $props()

	let value = $state("")
	let triggerRef = $state<HTMLButtonElement>(null!)

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		console.log("closeAndFocusTrigger")
		open = false
		onBlur?.()
		// tick().then(() => {
		// 	triggerRef.focus()
		// })
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
		{#snippet child({ props }: { props: any })}
			<Button variant="ghost" class="" {...props} role="combobox" aria-expanded={open}>
				Actions
				<span class="flex items-center gap-0.5" data-tauri-drag-region>
					<Kbd class="w-fit">
						{#if isMac}
							<Icon icon="ph-command" class="h-4 w-4 shrink-0" />
						{:else}
							Ctl
						{/if}
					</Kbd>
					+
					<Kbd><Icon icon="mynaui:letter-k-solid" class="h-4 w-4 shrink-0" /></Kbd>
				</span>
				<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-64 p-0">
		<Command.Root vimBindings={false}>
			<Command.Input
				placeholder="Select an Action"
				onkeydown={(e) => {
					if (e.key === "Escape") {
						closeAndFocusTrigger()
					}
				}}
			/>
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
							{#if action.icon}
								<IconMultiplexer icon={action.icon} class="!h-4 !w-4 shrink-0"></IconMultiplexer>
							{:else}
								<Icon icon="mdi:gear-outline" class="!h-4 !w-4 shrink-0"></Icon>
							{/if}
							{action.title}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
