<script lang="ts">
	import { SideBar } from "@kksh/svelte5"
	import AppSidebar from "$lib/components/app-sidebar.svelte"

	let { children } = $props()
</script>

<SideBar.Provider>
	<AppSidebar />
	<main>
		<SideBar.Trigger />
		{@render children?.()}
	</main>
</SideBar.Provider>
