<script lang="ts">
	import Icon from "@iconify/svelte"
	import { IconEnum, IconType, Icon as TIcon } from "@kksh/api/models"
	import { Button } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"

	const { icon, class: className }: { icon: TIcon; class?: string } = $props()
</script>

{#if icon.type === IconEnum.RemoteUrl}
	<img loading="lazy" class={cn("", className)} src={icon.value} alt="" />
{:else if icon.type === IconEnum.Iconify}
	<Icon icon={icon.value} class={cn("", className)} />
{:else if icon.type === IconEnum.Base64PNG}
	<img loading="lazy" src="data:image/png;base64, {icon.value}" alt="" />
{:else if icon.type === IconEnum.Text}
	<Button class={cn("shrink-0 text-center", className)} size="icon">
		{icon.value}
	</Button>
{:else if icon.type === IconEnum.Svg}
	<span>{@html icon.value}</span>
{:else}
	<Icon icon="mingcute:appstore-fill" class={cn("", className)} />
{/if}
