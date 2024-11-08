<script lang="ts">
	import type { DateValue } from "@internationalized/date"
	import { FormNodeNameEnum, FormSchema } from "@kksh/api/models"
	import { Button, Checkbox, Form, Input, Label, Select } from "@kksh/svelte5"
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
	onMount(() => {
		console.log(formSchema)
	})
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

{#snippet error(messages?: string[])}
	{#if messages}
		<ul>
			{#each messages as message}
				<li><small class="text-red-500">{message}</small></li>
			{/each}
		</ul>
	{/if}
{/snippet}
{#key formViewContent}
	<form class={cn("flex flex-col gap-2", className)} use:enhance>
		{#each formViewContent.fields as field}
			{@const _field = field as FormSchema.BaseField}
			{#if _field.label && !_field.hideLabel}
				<Label class="select-none" for={field.key}>{_field.label}</Label>
			{/if}
			{#if field.nodeName === FormNodeNameEnum.Number}
				{@const field2 = field as FormSchema.NumberField}
				<Input
					type="number"
					name={field.key}
					bind:value={$formData[field.key]}
					placeholder={field2.placeholder}
				/>
			{:else if field.nodeName === FormNodeNameEnum.Input}
				{@const field2 = field as FormSchema.InputField}
				<Input
					type="text"
					name={field2.key}
					bind:value={$formData[field2.key]}
					placeholder={field2.placeholder}
				/>
			{:else if field.nodeName === FormNodeNameEnum.Date}
				{@const field2 = field as FormSchema.DateField}
				<DatePickerWithPreset class="w-full" bind:value={$formData[field2.key]} />
			{:else if field.nodeName === FormNodeNameEnum.Select}
				{@const field2 = field as FormSchema.SelectField}
				<Select.Root type="single" name="favoriteFruit" bind:value={$formData[field2.key]}>
					<Select.Trigger class="w-80">
						{$formData[field2.key] ? $formData[field2.key] : "Select"}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<!-- <Select.GroupHeading>Fruits</Select.GroupHeading> -->
							{#each field2.options as option}
								<Select.Item value={option} label={option}>{option}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{:else if field.nodeName === FormNodeNameEnum.Array}
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
				<div class="flex items-center space-x-2">
					<Checkbox name={field2.key} bind:checked={$formData[field2.key]} />
					<Label
						id="terms-label"
						for={field2.key}
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
			{#if field.description}
				<p class="text-muted-foreground select-none text-sm">{field.description}</p>
			{/if}
			{@render error($errors[field.key] as string[] | undefined)}
		{/each}
		<Button type="submit">{formViewContent.submitBtnText ?? "Submit"}</Button>
	</form>
{/key}
<!-- <SuperDebug data={$formData} /> -->
