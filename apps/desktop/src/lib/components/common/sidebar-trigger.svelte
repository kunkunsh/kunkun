<script lang="ts">
	import { goHome } from "@/utils/route"
	import { Button, SideBar } from "@kksh/svelte5"
	import { Constants } from "@kksh/ui"
	import { ArrowLeftIcon } from "lucide-svelte"

	const { useSidebar } = SideBar
	const sidebar = useSidebar()
</script>

<div class="flex h-10 items-center gap-2 pl-1 pt-1" data-tauri-drag-region>
	<SideBar.Trigger class="z-50" />
	{#if sidebar.state === "collapsed"}
		<Button
			variant="outline"
			size="icon"
			class="z-50 {Constants.CLASSNAMES.BACK_BUTTON}"
			onclick={goHome}
		>
			<ArrowLeftIcon class="h-4 w-4" />
		</Button>
	{/if}
</div>
