<script lang="ts">
	import SidebarTrigger from "@/components/common/sidebar-trigger.svelte"
	import { goHomeOrCloseOnEscapeWithInput } from "@/utils/key"
	import { SideBar } from "@kksh/svelte5"
	import TroubleshootersSidebar from "./sidebar.svelte"

	let { children } = $props()
</script>

<svelte:window on:keydown={goHomeOrCloseOnEscapeWithInput} />

<SideBar.Provider style="--sidebar-width: 12rem;">
	<TroubleshootersSidebar class="flex-none" />
	<main class="grow overflow-x-clip">
		<SidebarTrigger />
		{@render children?.()}
	</main>
</SideBar.Provider>
