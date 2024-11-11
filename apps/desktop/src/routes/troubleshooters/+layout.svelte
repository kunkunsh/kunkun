<script lang="ts">
	import SidebarTrigger from "@/components/common/sidebar-trigger.svelte"
	import { SideBar } from "@kksh/svelte5"
	import TroubleshootersSidebar from "./sidebar.svelte"

	let { children } = $props()
</script>

<SideBar.Provider style="--sidebar-width: 12rem;">
	<TroubleshootersSidebar />
	<main class="w-full">
		<SidebarTrigger />
		{@render children?.()}
	</main>
</SideBar.Provider>
