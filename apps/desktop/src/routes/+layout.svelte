<script lang="ts">
	import { onMount } from "svelte"
	import "../app.css"
	import { init } from "@/utils/init"
	import { ModeWatcher, ThemeWrapper } from "@kksh/svelte5"
	import { Toaster } from "svelte-sonner"

	onMount(() => {
		init()
	})

	let { children } = $props()
</script>

<ModeWatcher />
<Toaster richColors closeButton />
<ThemeWrapper>
	{@render children()}
</ThemeWrapper>
