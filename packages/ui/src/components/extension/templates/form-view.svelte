<script lang="ts">
	import { FormNodeNameEnum, FormSchema } from "@kksh/api/models"
	import { Button, Progress } from "@kksh/svelte5"
	import { ArrowLeftIcon } from "lucide-svelte"
	import Form from "./form.svelte"

	let {
		formViewContent,
		pbar,
		onGoBack,
		onSubmit
	}: {
		formViewContent: FormSchema.Form
		pbar: number | null
		onGoBack: () => void
		onSubmit?: (formData: Record<string, string | number | boolean>) => void
	} = $props()
</script>

{#if pbar && pbar > 0}
	<Progress value={Math.min(pbar, 100)} class="absolute top-0 h-0.5 rounded-none" />
{/if}
{#if formViewContent}
	<div data-tauri-drag-region class="h-12 w-full"></div>
	<Button class="fixed left-2 top-2" size="icon" variant="outline" onclick={onGoBack}>
		<ArrowLeftIcon />
	</Button>
	<main class="container flex flex-col gap-2 pb-4">
		<h1 class="text-2xl font-bold">{formViewContent.title}</h1>
		{#if formViewContent.description}
			<p>{formViewContent.description}</p>
		{/if}
		<Form {formViewContent} {onSubmit} />
	</main>
{/if}
