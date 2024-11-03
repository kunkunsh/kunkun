<script lang="ts">
	import { IconEnum, type KunkunExtManifest } from "@kksh/api/models"
	import { permissionDescriptions } from "@kksh/api/permissions"
	import { HoverCard, ScrollArea } from "@kksh/svelte5"
	import { IconMultiplexer, Shiki } from "@kksh/ui"

	const {
		manifest,
		class: className
	}: {
		manifest: KunkunExtManifest
		class?: string
	} = $props()
</script>

<ul class={className}>
	{#each manifest?.permissions || [] as perm}
		<li class="flex h-8 items-center gap-2">
			<span class="font-mono text-sm">{typeof perm === "string" ? perm : perm.permission}</span>
			<HoverCard.Root>
				<HoverCard.Trigger class="flex items-center">
					<IconMultiplexer
						class="border"
						icon={{
							type: IconEnum.Iconify,
							value: "material-symbols:info-outline"
						}}
					/>
				</HoverCard.Trigger>
				<HoverCard.Content class="max-h-96 w-96 overflow-x-auto overflow-y-auto">
					<ScrollArea class="whitespace-nowrap" orientation="both">
						<span class="text-sm">
							{permissionDescriptions[typeof perm === "string" ? perm : perm.permission]}
						</span>
						<Shiki code={JSON.stringify(perm, null, 2)} lang="json" />
					</ScrollArea>
				</HoverCard.Content>
			</HoverCard.Root>
		</li>
	{/each}
</ul>
