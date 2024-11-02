<script lang="ts">
	import { cn } from "@/utils"
	import { Avatar } from "@kksh/svelte5"

	const { class: className }: { class?: string } = $props()
</script>

<footer data-tauri-drag-region class={cn("h-12 border-t", className)}>
	<Avatar.Root class="p-2">
		<Avatar.Image src="/logo-w-bg.png" alt="Kunkun Logo" class="select-none invert dark:invert-0" />
	</Avatar.Root>
</footer>
