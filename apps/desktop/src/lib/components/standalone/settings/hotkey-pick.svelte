<script lang="ts">
	import HotkeyInput from "@/components/common/HotkeyInput.svelte"
	import HotkeyInputPopover from "@/components/common/HotkeyInputPopover.svelte"
	import { appConfig } from "@/stores"
	import { updateAppHotkey } from "@/utils/hotkey"
	import { onMount } from "svelte"

	let savedHotkey = $state<string[]>([])

	onMount(() => {
		savedHotkey = $appConfig.triggerHotkey ?? []
	})

	function updateHotkey(keys: string[]) {
		savedHotkey = keys
		updateAppHotkey(keys, $appConfig.triggerHotkey).then(() => {
			appConfig.setTriggerHotkey(keys)
		})
	}
</script>

<HotkeyInputPopover {savedHotkey} onSubmit={updateHotkey} />
