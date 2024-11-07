<script lang="ts">
	import { Icon, IconEnum, IconType } from "@kksh/api/models"
	import { Button, ButtonModule, Dialog, Input, Label, Select } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import { ImageIcon } from "lucide-svelte"
	import IconMultiplexer from "./IconMultiplexer.svelte"

	const { icon, class: className }: { icon?: Icon; class?: string } = $props()
	function onClick(e: MouseEvent) {
		e.preventDefault()
		e.stopPropagation()
		console.log("clicked")
	}

	let iconType = $state<string>(icon?.type ?? IconEnum.Iconify)
	const iconOptions: Record<string, IconType> = {
		Iconify: IconEnum.Iconify,
		"Remote Url": IconEnum.RemoteUrl,
		Svg: IconEnum.Svg,
		"Base64 PNG": IconEnum.Base64PNG,
		Text: IconEnum.Text
	}
	const iconOptionsArray = $derived(Object.entries(iconOptions))
	const triggerContent = $derived(
		iconOptionsArray.find(([_, value]) => value === iconType)?.[0] ?? "Select a fruit"
	)
</script>

<button class={cn("block h-12 w-12", className)} onclick={onClick}>
	{#if icon}
		<IconMultiplexer {icon} />
	{:else}
		<ImageIcon class="h-full w-full" />
	{/if}
</button>

<Dialog.Root open={true}>
	<Dialog.Trigger class={ButtonModule.buttonVariants({ variant: "outline" })}>
		Select Icon
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Select Icon</Dialog.Title>
			<!-- <Dialog.Description></Dialog.Description> -->
		</Dialog.Header>

		<Select.Root type="single" name="icontype" bind:value={iconType}>
			<Select.Trigger class="w-[180px]">
				{triggerContent}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.GroupHeading>Fruits</Select.GroupHeading>
					{#each iconOptionsArray as [label, value]}
						<Select.Item {value}>{label}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>

        

		<!-- <div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="name" class="text-right">Name</Label>
				<Input id="name" value="Pedro Duarte" class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="username" class="text-right">Username</Label>
				<Input id="username" value="@peduarte" class="col-span-3" />
			</div>
		</div> -->
		<Dialog.Footer>
			<Button type="submit">Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
