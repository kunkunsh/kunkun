<script lang="ts">
	import AddDevExtForm from "@/components/standalone/settings/AddDevExtForm.svelte"
</script>

<main class="container">
	<h2 class="text-2xl font-bold">Add Dev Extension</h2>
	<small>
		There are 4 options to install an extension in developer mode. Either load it from your local
		tarball file, a tarball remote URL, npm package name or load from a remote URL.
	</small>
	<AddDevExtForm />
</main>
