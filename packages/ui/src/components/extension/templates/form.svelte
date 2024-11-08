<script lang="ts">
	import type { DateValue } from "@internationalized/date"
	import { FormNodeNameEnum, FormSchema } from "@kksh/api/ui/worker"
	import { Button, Checkbox, Form, Input, Label } from "@kksh/svelte5"
	import { DatePickerWithPreset, Shiki } from "@kksh/ui"
	import { buildFormSchema, cn } from "@kksh/ui/utils"
	import { onMount } from "svelte"
	import SuperDebug, { defaults, superForm } from "sveltekit-superforms"
	import { valibot, valibotClient } from "sveltekit-superforms/adapters"
	import * as v from "valibot"
	import DatePicker from "../../common/date/DatePicker.svelte"
	import TauriLink from "../../common/TauriLink.svelte"

	let {
		formViewContent,
		class: className,
		onSubmit
	}: {
		formViewContent: FormSchema.Form
		class?: string
		onSubmit?: (formData: Record<string, any>) => void
	} = $props()
	const formSchema = $derived(buildFormSchema(formViewContent))
	const form = $derived(
		superForm(defaults(valibot(formSchema)), {
			validators: valibotClient(formSchema),
			SPA: true,
			onUpdate({ form, cancel }) {
				cancel()
				console.log($formData)
				if (!form.valid) return
				const parsedData = v.parse(formSchema, $formData)
				console.log(parsedData)
				onSubmit?.(parsedData)
			}
		})
	)
	const { form: formData, enhance, errors } = $derived(form)
</script>

{#key formViewContent}
	<form class={cn("flex flex-col gap-1", className)} use:enhance>
		{#each formViewContent.fields as field}
			{#if field.nodeName === FormNodeNameEnum.Number}
				{@const field2 = field as FormSchema.NumberField}
				<Label class="select-none" for={field2.key}>{field2.label}</Label>
				<Input type="number" name={field.key} bind:value={$formData[field.key]} />
			{:else if field.nodeName === FormNodeNameEnum.Input}
				{@const field2 = field as FormSchema.InputField}
				<Label class="select-none" for={field2.key}>{field2.label}</Label>
				<Input type="text" name={field2.key} bind:value={$formData[field2.key]} />
			{:else if field.nodeName === FormNodeNameEnum.Date}
				{@const field2 = field as FormSchema.DateField}
				<Label class="select-none" for={field2.key}>{field2.label}</Label>
				<DatePickerWithPreset class="w-full" bind:value={$formData[field2.key]} />
			{:else if field.nodeName === FormNodeNameEnum.Select}{:else if field.nodeName === FormNodeNameEnum.Array}
				<span>
					Array is not supported yet
					<TauriLink href="https://github.com/kunkunsh/kunkun/issues/19"
						>Tracked at https://github.com/kunkunsh/kunkun/issues/19</TauriLink
					>
				</span>
			{:else if field.nodeName === FormNodeNameEnum.Form}
				<span>
					Nested Form is not supported yet
					<TauriLink href="https://github.com/kunkunsh/kunkun/issues/19"
						>Tracked at https://github.com/kunkunsh/kunkun/issues/19</TauriLink
					>
				</span>
			{:else if field.nodeName === FormNodeNameEnum.Boolean}
				{@const field2 = field as FormSchema.InputField}
				<Label class="select-none" for={field2.key}>{field2.label}</Label>

				<div class="flex items-center space-x-2">
					<Checkbox name={field2.key} bind:checked={$formData[field2.key]} />
					<Label
						id="terms-label"
						for="terms"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						{field2.description}
					</Label>
				</div>
			{:else}
				<span>
					{field.nodeName} is not supported yet
					<TauriLink href="https://github.com/kunkunsh/kunkun/issues/19"
						>Tracked at https://github.com/kunkunsh/kunkun/issues/19</TauriLink
					>
				</span>
			{/if}
			<p class="text-muted-foreground select-none text-sm">{field.description}</p>
		{/each}
		<Button type="submit">{formViewContent.submitBtnText ?? "Submit"}</Button>
	</form>
{/key}
