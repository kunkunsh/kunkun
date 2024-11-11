<script lang="ts">
	import { SideBar } from "@kksh/svelte5"
	import TroubleshootersSidebar from "./sidebar.svelte"

	let { children } = $props()
</script>

<SideBar.Provider>
	<TroubleshootersSidebar />
	<main class="w-full">
		{@render children?.()}
		<SideBar.Trigger class="fixed" />
	</main>
</SideBar.Provider>
