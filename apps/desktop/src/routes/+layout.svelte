<script lang="ts">
	import { onMount } from "svelte"
	import "../app.css"
	import { ModeWatcher, ThemeWrapper } from "@kksh/svelte5"
	import { dev } from "$app/environment"
	import { Toaster } from "svelte-sonner"

	onMount(() => {
		if (!dev) {
			document.addEventListener("contextmenu", function (event) {
				event.preventDefault()
				console.warn("contextmenu disabled in release mode", event)
			})
		}
	})

	let { children } = $props()
</script>

<ModeWatcher />
<Toaster richColors closeButton />
<ThemeWrapper>
	{@render children()}
</ThemeWrapper>
