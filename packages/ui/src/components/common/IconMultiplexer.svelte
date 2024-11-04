<script lang="ts">
	import Icon from "@iconify/svelte"
	import { IconEnum, IconType, Icon as TIcon } from "@kksh/api/models"
	import { Button } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"

	const {
		icon,
		class: className,
		...restProps
	}: { icon: TIcon; class?: string; [key: string]: any } = $props()
</script>

{#if icon.type === IconEnum.RemoteUrl}
	<img loading="lazy" class={cn("", className)} src={icon.value} alt="" {...restProps} />
{:else if icon.type === IconEnum.Iconify}
	<Icon icon={icon.value} class={cn("", className)} {...restProps} />
{:else if icon.type === IconEnum.Base64PNG}
	<img loading="lazy" src="data:image/png;base64, {icon.value}" alt="" {...restProps} />
{:else if icon.type === IconEnum.Text}
	<Button class={cn("shrink-0 text-center", className)} size="icon" {...restProps}>
		{icon.value}
	</Button>
{:else if icon.type === IconEnum.Svg}
	<span {...restProps}>{@html icon.value}</span>
{:else}
	<Icon icon="mingcute:appstore-fill" class={cn("", className)} {...restProps} />
{/if}
