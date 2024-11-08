<script lang="ts">
	import { listen, TauriEvent, type UnlistenFn } from "@tauri-apps/api/event"
	import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
	import { onDestroy, onMount, type Snippet } from "svelte"

	let unlisteners: UnlistenFn[] = []
	const {
		children,
		onEnter,
		onDrop,
		onCancelled,
		onOver
	}: {
		children: Snippet
		onEnter?: (event: any) => void
		onDrop?: (event: any) => void
		onCancelled?: (event: any) => void
		onOver?: (event: any) => void
	} = $props()
	const appWin = getCurrentWebviewWindow()

	onMount(async () => {
		if (onEnter) await appWin.listen(TauriEvent.DRAG_ENTER, onEnter)
		if (onDrop) await appWin.listen(TauriEvent.DRAG_DROP, onDrop)
		if (onCancelled) await appWin.listen(TauriEvent.DRAG_LEAVE, onCancelled)
		if (onOver) await appWin.listen(TauriEvent.DRAG_OVER, onOver)
	})

	onDestroy(() => {
		for (const unlisten of unlisteners) {
			unlisten()
		}
	})
</script>

<span>
	{@render children()}
</span>
