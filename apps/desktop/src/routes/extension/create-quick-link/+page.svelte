<script lang="ts">
	import { quickLinks } from "@/stores/quick-links"
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { Icon, IconEnum, IconType } from "@kksh/api/models"
	import { Button, Input } from "@kksh/svelte5"
	import { Form, IconSelector } from "@kksh/ui"
	import { dev } from "$app/environment"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { toast } from "svelte-sonner"
	import SuperDebug, { defaults, superForm } from "sveltekit-superforms"
	import { valibot, valibotClient } from "sveltekit-superforms/adapters"
	import * as v from "valibot"

	const formSchema = v.object({
		name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
		link: v.pipe(v.string(), v.url(), v.minLength(5), v.maxLength(1000)),
		iconType: IconType,
		iconValue: v.string(),
		invertIcon: v.boolean()
	})
	let icon = $state<Icon>({
		type: IconEnum.Iconify,
		value: "material-symbols:link",
		invert: false
	})
	const form = superForm(defaults(valibot(formSchema)), {
		validators: valibotClient(formSchema),
		SPA: true,
		onUpdate({ form, cancel }) {
			cancel()
			if (!form.valid) return
			const { name, link, iconType, iconValue } = form.data
			quickLinks
				.createQuickLink(name, link, icon)
				.then(() => {
					toast.success("Quicklink created successfully")
					goBack()
				})
				.catch((err) => {
					toast.error("Failed to create quicklink", { description: err })
				})
		}
	})

	const { form: formData, enhance, errors } = form
	const placeholders = {
		name: "Quick Link Name",
		link: "https://google.com/search?q={argument}"
	}

	const defaultFaviconUrl = $derived(
		$formData.link ? new URL($formData.link).origin + "/favicon.ico" : undefined
	)
	$effect(() => {
		if (defaultFaviconUrl && defaultFaviconUrl.length > 0) {
			icon.type = IconEnum.RemoteUrl
			icon.value = defaultFaviconUrl
		}
	})

	$effect(() => {
		$formData.iconType = icon.type
		$formData.iconValue = icon.value
		$formData.invertIcon = icon.invert ?? false
	})
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" class="fixed left-2 top-2 z-50" onclick={goBack}>
	<ArrowLeftIcon class="h-4 w-4" />
</Button>
<div class="h-12" data-tauri-drag-region></div>
<div class="container">
	<h1 class="text-2xl font-bold">Create Quick Link</h1>
	<form method="POST" use:enhance>
		<Form.Field {form} name="name">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Name</Form.Label>
					<Input {...props} bind:value={$formData.name} placeholder={placeholders.name} />
				{/snippet}
			</Form.Control>
			<Form.Description>Quick Link Display Name</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="link">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Link</Form.Label>
					<Input {...props} bind:value={$formData.link} placeholder={placeholders.link} />
				{/snippet}
			</Form.Control>
			<Form.Description>Quick Link URL</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<IconSelector class="border" bind:icon />
		<input name="iconType" hidden type="text" bind:value={$formData.iconType} />
		<input name="iconValue" hidden type="text" bind:value={$formData.iconValue} />
		<input name="invertIcon" hidden type="text" bind:value={$formData.invertIcon} />
		<Form.Button class="my-1">Submit</Form.Button>
	</form>
</div>
{#if dev}
	<div class="p-5">
		<SuperDebug data={$formData} />
	</div>
{/if}
