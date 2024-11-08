<script lang="ts">
	import { FormNodeNameEnum, FormSchema } from "@kksh/api/ui/worker"
	import { Button } from "@kksh/svelte5"
	import { ArrowLeftIcon } from "lucide-svelte"
	import Form from "./form.svelte"

	let { formViewContent, onGoBack }: { formViewContent: FormSchema.Form; onGoBack: () => void } =
		$props()
</script>

<div data-tauri-drag-region class="h-12 w-full"></div>
<Button class="fixed left-2 top-2" size="icon" variant="outline" onclick={onGoBack}>
	<ArrowLeftIcon />
</Button>
<main class="container flex flex-col gap-2">
	<h1 class="text-2xl font-bold">{formViewContent.title}</h1>
	<Form {formViewContent} />
</main>
<!-- <pre>{JSON.stringify(formViewContent, null, 2)}</pre> -->
