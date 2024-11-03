<script lang="ts">
	import { IconEnum, type OSPlatformEnum } from "@kksh/api/models"
	import { IconMultiplexer } from "@kksh/ui"

	const { platforms }: { platforms: OSPlatformEnum[] } = $props()
</script>

<div class="flex gap-2">
	<IconMultiplexer
		icon={{
			type: IconEnum.Iconify,
			value: "logos:linux-tux"
		}}
	/>
	<IconMultiplexer
		icon={{
			type: IconEnum.Iconify,
			value: "basil:apple-solid"
		}}
	/>
	<IconMultiplexer
		icon={{
			type: IconEnum.Iconify,
			value: "devicon:windows8"
		}}
	/>
</div>
