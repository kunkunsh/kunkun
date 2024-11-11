<script lang="ts">
	import { goBackOnEscape, goHomeOnEscape } from "@/utils/key"
	import { goBack, goHome } from "@/utils/route"
	import { SideBar } from "@kksh/svelte5"
	import SidebarTrigger from "$lib/components/common/sidebar-trigger.svelte"
	import SettingsSidebar from "./sidebar.svelte"

	let { children } = $props()
	function onKeyDown(e: KeyboardEvent) {
		console.log(e)
		if (e.key === "Escape") {
			let target = e.target as HTMLElement
			if (target instanceof HTMLInputElement) {
				if (target.value === "") {
					goHome()
				} else {
					target.value = ""
				}
			} else {
				goHome()
			}
		}
	}
	const { useSidebar } = SideBar
</script>

<svelte:window on:keydown={onKeyDown} />

<SideBar.Provider style="--sidebar-width: 13rem;">
	<SettingsSidebar />
	<main class="w-full border-4 border-blue-500">
		<SidebarTrigger />
		{@render children?.()}
	</main>
</SideBar.Provider>
