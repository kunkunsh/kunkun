<script lang="ts">
	import { goHome } from "@/utils/route"
	import { Button, SideBar } from "@kksh/svelte5"
	import { ArrowLeftIcon } from "lucide-svelte"

	const { useSidebar } = SideBar
	const sidebar = useSidebar()
</script>

<div class="flex items-center h-10 pl-1 pt-1 gap-2" data-tauri-drag-region>
	<SideBar.Trigger />
	{#if sidebar.state === "collapsed"}
		<Button variant="outline" size="icon" class="" onclick={goHome}>
			<ArrowLeftIcon class="h-4 w-4" />
		</Button>
	{/if}
</div>
