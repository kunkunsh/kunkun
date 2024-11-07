<script lang="ts">
	import { goBackOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { createQuickLinkCommand } from "@kksh/extension/db"
	import { Button, Input } from "@kksh/svelte5"
	import { Form } from "@kksh/ui"
	import { dev } from "$app/environment"
	import { ArrowLeftIcon } from "lucide-svelte"
	import { toast } from "svelte-sonner"
	import SuperDebug, {
		defaults,
		superForm,
		type Infer,
		type SuperValidated
	} from "sveltekit-superforms"
	import { valibot, valibotClient, zod, zodClient } from "sveltekit-superforms/adapters"
	import * as v from "valibot"
	import SettingsForm from "./settings-form.svelte"

	const formSchema = v.object({
		name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
		link: v.pipe(v.string(), v.minLength(5), v.maxLength(1000))
	})

	const form = superForm(defaults(valibot(formSchema)), {
		validators: valibotClient(formSchema),
		SPA: true,
		onUpdate({ form }) {
			if (!form.valid) return
			const { name, link } = form.data
			createQuickLinkCommand(name, link)
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
</script>

<svelte:window on:keydown={goBackOnEscape} />
<Button variant="outline" size="icon" class="absolute left-2 top-2 z-50" onclick={goBack}>
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
		<Form.Button>Submit</Form.Button>
	</form>
</div>
{#if dev}
	<div class="p-3">
		<SuperDebug data={$formData} />
	</div>
{/if}
