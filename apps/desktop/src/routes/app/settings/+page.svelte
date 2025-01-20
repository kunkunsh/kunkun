<script lang="ts">
	import GeneralSettings from "@/components/standalone/general-settings.svelte"
	import * as m from "@/paraglide/messages"
</script>

<main class="container flex flex-col space-y-2">
	<pre>{m.settings_general_language()}</pre>
	<GeneralSettings />
</main>
