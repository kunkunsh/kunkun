<script lang="ts">
	import DevExtPathForm from "@/components/standalone/settings/DevExtPathForm.svelte"
	import * as m from "@/paraglide/messages"
</script>

<main class="container">
	<h2 class="text-2xl font-bold">{m.settings_set_dev_ext_title()}</h2>
	<p>{m.settings_set_dev_ext_description()}</p>
	<DevExtPathForm />
</main>
