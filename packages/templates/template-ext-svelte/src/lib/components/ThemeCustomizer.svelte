<script lang="ts">
	import { ui } from "@kksh/api/ui/iframe"
	import { ThemeCustomizerButton, updateTheme, type ThemeConfig } from "@kksh/svelte"
	import { onMount } from "svelte"

	let config: ThemeConfig = {
		radius: 0.5,
		theme: "zinc",
		lightMode: "auto"
	}
	onMount(() => {
		ui.getTheme().then((theme) => {
			config = theme
		})
	})

	$: updateTheme(config)
</script>

<ThemeCustomizerButton bind:config />
