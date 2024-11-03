<script lang="ts">
	import { Avatar } from "@kksh/svelte5"
	import { cn } from "@kksh/ui/utils"

	const { class: className }: { class?: string } = $props()
</script>

<footer data-tauri-drag-region class={cn("h-12 border-t", className)}>
	<Avatar.Root class="p-2">
		<Avatar.Image src="/favicon.png" alt="Kunkun Logo" class="select-none invert dark:invert-0" />
	</Avatar.Root>
</footer>
