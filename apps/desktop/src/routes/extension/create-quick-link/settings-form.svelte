<script lang="ts">
	// import { Form, Input } from "@kksh/svelte5"
	import { Input } from "@kksh/svelte5"
	import { Form } from "@kksh/ui"
	// import { FormControl } from "@kksh/svelte5/components/ui/form"
	// import FormField from "@kksh/svelte5/components/ui/form/form-field.svelte"
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms"
	import { zodClient } from "sveltekit-superforms/adapters"
	import { formSchema, type FormSchema } from "./schema"

	export let data: SuperValidated<Infer<FormSchema>>

	const form = superForm(data, {
		validators: zodClient(formSchema)
	})

	const { form: formData, enhance } = form
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
