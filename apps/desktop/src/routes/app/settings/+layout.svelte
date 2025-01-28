<script lang="ts">
	import { goHomeOrCloseOnEscapeWithInput } from "@/utils/key"
	import { Sidebar } from "@kksh/svelte5"
	import SidebarTrigger from "$lib/components/common/sidebar-trigger.svelte"
	import SettingsSidebar from "./sidebar.svelte"

	let { children } = $props()
</script>

<svelte:window on:keydown={goHomeOrCloseOnEscapeWithInput} />

<Sidebar.Provider style="--sidebar-width: 13rem;">
	<SettingsSidebar />
	<main class="flex grow flex-col overflow-x-clip">
		<SidebarTrigger />
		{@render children?.()}
	</main>
</Sidebar.Provider>
