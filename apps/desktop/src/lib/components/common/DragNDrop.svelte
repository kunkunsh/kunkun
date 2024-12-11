<script lang="ts">
	import { listen, TauriEvent, type EventCallback, type UnlistenFn } from "@tauri-apps/api/event"
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
		onDrop?: EventCallback<{ paths: string[] }>
		onCancelled?: (event: any) => void
		onOver?: (event: any) => void
	} = $props()
	const appWin = getCurrentWebviewWindow()

	onMount(async () => {
		if (onEnter) unlisteners.push(await appWin.listen(TauriEvent.DRAG_ENTER, onEnter))
		if (onDrop)
			unlisteners.push(await appWin.listen<{ paths: string[] }>(TauriEvent.DRAG_DROP, onDrop))
		if (onCancelled) unlisteners.push(await appWin.listen(TauriEvent.DRAG_LEAVE, onCancelled))
		if (onOver) unlisteners.push(await appWin.listen(TauriEvent.DRAG_OVER, onOver))
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
