<script lang="ts">
	import AddDevExtForm from "@/components/standalone/settings/AddDevExtForm.svelte"
	import * as m from "@/paraglide/messages"
</script>

<main class="container">
	<h2 class="text-2xl font-bold">{m.settings_add_dev_ext_title()}</h2>
	<small>
		{m.settings_add_dev_ext_description()}
	</small>
	<AddDevExtForm />
</main>
