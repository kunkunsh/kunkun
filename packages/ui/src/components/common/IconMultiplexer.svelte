<script lang="ts">
	import Icon from "@iconify/svelte"
	import { IconEnum, IconType, Icon as TIcon } from "@kksh/api/models"
	import { Button } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"
	import * as v from "valibot"
	import { styleObjectToString } from "../../utils/style"

	const hexColorValidator = v.pipe(v.string(), v.hexColor("The hex color is badly formatted."))

	const {
		icon,
		class: className,
		...restProps
	}: { icon: TIcon; class?: string; [key: string]: any } = $props()

	let remoteIconError = $state(false)

	function fillHexColor(style: Record<string, string>, key: string, value?: string) {
		if (!value) return
		const parseRes = v.safeParse(hexColorValidator, value)
		if (!parseRes.success) {
			console.error(v.flatten(parseRes.issues))
			return
		}
		if (parseRes.output) style[key] = parseRes.output
	}

	let customStyle = $derived.by(() => {
		const style: Record<string, string> = {}
		fillHexColor(style, "color", icon.hexColor)
		fillHexColor(style, "background-color", icon.bgColor)
		return style
	})

	let style = $derived(styleObjectToString(customStyle))
</script>

{#if icon.type === IconEnum.RemoteUrl}
	{#if !remoteIconError}
		<img
			loading="lazy"
			class={cn("dark-invert", className, { invert: icon.invert, "dark:invert": icon.darkInvert })}
			src={icon.value}
			alt=""
			{style}
			onerror={() => {
				remoteIconError = true
			}}
			{...restProps}
		/>
	{:else}
		<Icon
			icon="carbon:unknown-filled"
			class={cn("", className, { invert: icon.invert, "dark:invert": icon.darkInvert })}
			{style}
			{...restProps}
		/>
	{/if}
{:else if icon.type === IconEnum.Iconify}
	<Icon
		icon={icon.value}
		class={cn("", className, { invert: icon.invert, "dark:invert": icon.darkInvert })}
		{style}
		{...restProps}
	/>
{:else if icon.type === IconEnum.Base64PNG}
	<img
		class={cn(className, { invert: icon.invert, "dark:invert": icon.darkInvert })}
		loading="lazy"
		src="data:image/png;base64, {icon.value}"
		alt=""
		{style}
		{...restProps}
	/>
{:else if icon.type === IconEnum.Text}
	<Button
		class={cn("shrink-0 text-center", className, {
			invert: icon.invert,
			"dark:invert": icon.darkInvert
		})}
		{style}
		size="icon"
		{...restProps}
	>
		{icon.value}
	</Button>
{:else if icon.type === IconEnum.Svg}
	<span
		{...restProps}
		class={cn(className, { invert: icon.invert, "dark:invert": icon.darkInvert })}
		{style}>{@html icon.value}</span
	>
{:else}
	<Icon
		icon="mingcute:appstore-fill"
		{style}
		class={cn("", className, { invert: icon.invert, "dark:invert": icon.darkInvert })}
		{...restProps}
	/>
{/if}
