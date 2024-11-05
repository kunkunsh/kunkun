<script lang="ts">
	import { Error, Layouts } from "@kksh/ui"
	import { goto } from "$app/navigation"
	import { page } from "$app/stores"

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			goto("/")
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<Layouts.Center class="min-h-screen py-5">
	<Error.RawErrorJSONPreset
		title="Fail to Load Extension"
		class="w-fit max-w-screen-sm border-2 border-red-500"
		message={$page.error?.message ?? "Unknown Error"}
		onGoBack={() => goto("/")}
		rawJsonError={JSON.stringify($page, null, 2)}
	/>
</Layouts.Center>
