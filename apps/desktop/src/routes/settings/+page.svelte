<script lang="ts">
	import { goHome } from "@/utils/route"
	import { Button, SideBar } from "@kksh/svelte5"
	import { ArrowLeftIcon } from "lucide-svelte"

	const { useSidebar } = SideBar
	const sidebar = useSidebar()
</script>

<!-- <div class="fixed left-0 top-0 h-10 w-screen" data-tauri-drag-region></div> -->

<!-- <div data-tauri-drag-region class="absolute top-0 h-10 w-screen border bg-red-500 -z-40"></div> -->
