<script lang="ts">
	import { goHome } from "@/utils/route"
	import { Error, Layouts } from "@kksh/ui"
	import { page } from "$app/stores"

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			window.history.back()
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<Layouts.Center class="min-h-screen py-5">
	<Error.RawErrorJSONPreset
		title="Error"
		class="w-fit max-w-screen-sm border-2 border-red-500"
		message={$page.error?.message ?? "Unknown Error"}
		onGoBack={goHome}
		rawJsonError={JSON.stringify($page, null, 2)}
	/>
</Layouts.Center>
