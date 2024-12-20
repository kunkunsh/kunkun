<script lang="ts">
	import { appConfig, extensions } from "@/stores"
	import { Input } from "@kksh/svelte5"
	import { Form } from "@kksh/ui"
	import { goto } from "$app/navigation"
	import { toast } from "svelte-sonner"
	import SuperDebug, { defaults, superForm } from "sveltekit-superforms"
	import { valibot, valibotClient } from "sveltekit-superforms/adapters"
	import * as v from "valibot"

	const npmPackageNameFormSchema = v.object({
		name: v.pipe(v.string(), v.minLength(1))
	})

	async function onNpmPackageNameSubmit(data: v.InferOutput<typeof npmPackageNameFormSchema>) {
		if (!$appConfig.devExtensionPath) {
			toast.warning(
				"Please set the dev extension path in the settings to install tarball extension"
			)
			return goto("/app/settings/set-dev-ext-path")
		}
		await extensions
			.installFromNpmPackageName(data.name, $appConfig.devExtensionPath)
			.then(() => {
				toast.success("Success", { description: "Extension installed successfully" })
			})
			.catch((err) => {
				toast.warning("Failed to install extension", { description: err })
			})
	}

	const form = superForm(defaults(valibot(npmPackageNameFormSchema)), {
		validators: valibotClient(npmPackageNameFormSchema),
		SPA: true,
		onUpdate({ form, cancel }) {
			if (!form.valid) {
				console.log("invalid")
				return
			}
			console.log(form.data)
			onNpmPackageNameSubmit(form.data)
			cancel()
		}
	})

	const { form: formData, enhance, errors } = form
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<div class="flex items-center gap-2">
					<Input {...props} bind:value={$formData.name} placeholder="NPM Package Name" />
					<Form.Button class="my-1">Install</Form.Button>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>
