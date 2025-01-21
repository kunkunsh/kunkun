<script lang="ts">
	import { IconEnum, OSPlatformEnum } from "@kksh/api/models"
	import { IconMultiplexer } from "@kksh/ui"

	const { platforms }: { platforms: OSPlatformEnum[] } = $props()
</script>

<div class="flex gap-2">
	{#if platforms.includes(OSPlatformEnum.linux)}
		<IconMultiplexer
			icon={{
				type: IconEnum.Iconify,
				value: "logos:linux-tux"
			}}
		/>
	{/if}
	{#if platforms.includes(OSPlatformEnum.macos)}
		<IconMultiplexer
			icon={{
				type: IconEnum.Iconify,
				value: "basil:apple-solid"
			}}
		/>
	{/if}
	{#if platforms.includes(OSPlatformEnum.windows)}
		<IconMultiplexer
			icon={{
				type: IconEnum.Iconify,
				value: "devicon:windows8"
			}}
		/>
	{/if}
</div>
