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

<Layouts.Center class="h-screen">
	<Error.RawErrorJSONPreset
		title="Fail to Load Extension"
		class="w-fit max-w-screen-sm"
		message={$page.error?.message ?? "Unknown Error"}
		onnGoBack={() => goto("/")}
		rawJsonError={JSON.stringify($page, null, 2)}
	/>
</Layouts.Center>
