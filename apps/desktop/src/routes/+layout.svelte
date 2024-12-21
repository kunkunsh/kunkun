<script lang="ts">
	import "../app.css"
	import { ModeWatcher, ThemeWrapper } from "@kksh/svelte5"

	let { children } = $props()
</script>

<ModeWatcher />
<ThemeWrapper>
	{@render children()}
</ThemeWrapper>
