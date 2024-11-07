<script lang="ts">
	import { Input } from "@kksh/svelte5"
	import { Form } from "@kksh/ui"
	import { applyAction } from "$app/forms"
	import { defaults, superForm, type Infer, type SuperValidated } from "sveltekit-superforms"
	import { valibotClient, zod, zodClient } from "sveltekit-superforms/adapters"
	import { formSchema, type FormSchema } from "./schema"

	const form = superForm(defaults(zod(formSchema)), {
		validators: zodClient(formSchema),
		SPA: true,
		onUpdate({ form }) {
			console.log(form)
			console.log(form.valid)
		}
	})

	const { form: formData, enhance, errors } = form

	function onSubmit(event: Event) {
		event.preventDefault()
		console.log($formData)
	}
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="username">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Username</Form.Label>
				<Input {...props} bind:value={$formData.username} />
			{/snippet}
		</Form.Control>
		<Form.Description>This is your public display name.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</form>
