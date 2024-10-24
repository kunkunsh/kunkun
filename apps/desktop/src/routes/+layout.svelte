<script lang="ts">
	import "../app.css"
	import { Toaster } from "@kksh/svelte5"

	let { children } = $props()
</script>

<Toaster richColors />
{@render children()}
