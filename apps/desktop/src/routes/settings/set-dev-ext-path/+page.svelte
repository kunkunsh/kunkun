<script lang="ts">
	import DevExtPathForm from "@/components/standalone/settings/DevExtPathForm.svelte"
</script>

<div class="fixed left-0 top-0 h-10 w-screen" data-tauri-drag-region></div>
<main class="container pt-10">
	<h2 class="text-2xl font-bold">Set Dev Extension Path</h2>
	<p>This is where your extensions will be installed.</p>
	<DevExtPathForm />
</main>
