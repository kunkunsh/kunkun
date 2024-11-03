<script lang="ts">
	import { Error, Layouts } from "@kksh/ui"
	import { page } from "$app/stores"

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			window.history.back()
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<Layouts.Center class="h-screen">
	<Error.RawErrorJSONPreset
		title="Unknown Error"
		class="w-fit max-w-screen-sm"
		message={$page.error?.message ?? "Unknown Error"}
		onnGoBack={() => window.history.back()}
		rawJsonError={JSON.stringify($page, null, 2)}
	/>
</Layouts.Center>
