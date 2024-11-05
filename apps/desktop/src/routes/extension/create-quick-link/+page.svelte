<script lang="ts">
	import type { PageData } from "./$types.js"
	import SettingsForm from "./settings-form.svelte"

	export let data: PageData
</script>

<div class="container pt-10">
	<SettingsForm data={data.form} />
</div>
