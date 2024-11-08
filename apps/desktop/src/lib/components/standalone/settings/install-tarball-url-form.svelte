<script lang="ts">
	import { appConfig, extensions } from "@/stores"
	import { Input } from "@kksh/svelte5"
	import { Form } from "@kksh/ui"
	import { goto } from "$app/navigation"
	import { toast } from "svelte-sonner"
	import SuperDebug, { defaults, superForm } from "sveltekit-superforms"
	import { valibot, valibotClient } from "sveltekit-superforms/adapters"
	import * as v from "valibot"

	const urlFormSchema = v.object({
		url: v.pipe(v.string(), v.url())
	})

	async function onUrlSubmit(data: v.InferOutput<typeof urlFormSchema>) {
		// data.url
		// https://storage.huakun.tech/vscode-0.0.6.tgz
		if (!$appConfig.devExtensionPath) {
			toast.warning(
				"Please set the dev extension path in the settings to install tarball extension"
			)
			return goto("/settings/set-dev-ext-path")
		}
		await extensions
			.installFromTarballUrl(data.url, $appConfig.devExtensionPath)
			.then(() => {
				toast.success("Sucecss", { description: "Extension installed successfully" })
			})
			.catch((err) => {
				toast.warning("Failed to install extension", { description: err })
			})
	}

	const form = superForm(defaults(valibot(urlFormSchema)), {
		validators: valibotClient(urlFormSchema),
		SPA: true,
		onUpdate({ form, cancel }) {
			if (!form.valid) {
				console.log("invalid")
				return
			}
			console.log(form.data)
			onUrlSubmit(form.data)
			cancel()
		}
	})
	const { form: formData, enhance, errors } = form
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="url">
		<Form.Control>
			{#snippet children({ props })}
				<flex items-center gap-2>
					<Input {...props} bind:value={$formData.url} placeholder="Tarball URL" />
					<Form.Button class="my-1">Install</Form.Button>
				</flex>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>
