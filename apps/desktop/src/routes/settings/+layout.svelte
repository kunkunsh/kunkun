<script lang="ts">
	import { goBackOnEscape, goHomeOnEscape } from "@/utils/key"
	import { goBack } from "@/utils/route"
	import { SideBar } from "@kksh/svelte5"
	import SettingsSidebar from "./sidebar.svelte"

	let { children } = $props()
	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			let target = e.target as HTMLElement
			if (target instanceof HTMLInputElement) {
				if (target.value === "") {
					goBack()
				} else {
					target.value = ""
				}
			} else {
				goBack()
			}
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<SideBar.Provider>
	<SettingsSidebar />
	<main class="w-full">
		{@render children?.()}
		<SideBar.Trigger class="fixed top-0" />
	</main>
</SideBar.Provider>
